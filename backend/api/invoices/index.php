<?php
require_once __DIR__ . '/../../bootstrap.php';

$method = Request::method();
$user   = Auth::require();
$userId = (int)$user['id'];
$role   = $user['role'];
$id     = (int)Request::query('id', 0);

// Helper: load full invoice with items + payments
function loadInvoice(int $id): ?array {
    $inv = DB::row("SELECT i.*, c.name as client_name, c.email as client_email,
                           c.phone as client_phone, c.company_name as client_company,
                           c.address as client_address, c.gst_number as client_gst
                    FROM invoices i
                    JOIN clients c ON c.id = i.client_id
                    WHERE i.id = ?", [$id]);
    if (!$inv) return null;
    $inv['items']    = DB::query("SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id", [$id]);
    $inv['payments'] = DB::query("SELECT * FROM payments WHERE invoice_id = ? ORDER BY paid_at DESC", [$id]);
    $inv['total_paid']   = array_sum(array_column($inv['payments'], 'amount'));
    $inv['balance_due']  = $inv['total'] - $inv['total_paid'];
    return $inv;
}

// Helper: generate invoice number
function generateInvoiceNumber(): string {
    $year = date('Y');
    $row  = DB::row("SELECT COUNT(*) as cnt FROM invoices WHERE YEAR(created_at) = ?", [$year]);
    $next = ($row['cnt'] ?? 0) + 1;
    return 'INV-' . $year . '-' . str_pad($next, 4, '0', STR_PAD_LEFT);
}

// ── GET /invoices ──
if ($method === 'GET' && !$id) {
    if (!in_array($role, ['admin', 'staff'])) Response::error('Forbidden', 403);

    $where  = "WHERE i.user_id = ?";
    $params = [$userId];

    if ($status = Request::query('status')) {
        $where   .= " AND i.status = ?";
        $params[] = $status;
    }
    if ($clientId = Request::query('client_id')) {
        $where   .= " AND i.client_id = ?";
        $params[] = $clientId;
    }

    $invoices = DB::query(
        "SELECT i.*, c.name as client_name, c.company_name as client_company
         FROM invoices i
         JOIN clients c ON c.id = i.client_id
         $where
         ORDER BY i.created_at DESC",
        $params
    );

    // Add payment totals
    foreach ($invoices as &$inv) {
        $paid = DB::row("SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE invoice_id = ?", [$inv['id']]);
        $inv['total_paid']  = (float)($paid['total'] ?? 0);
        $inv['balance_due'] = (float)$inv['total'] - $inv['total_paid'];
        $inv['items']       = [];
        $inv['payments']    = [];
    }
    Response::success($invoices);
}

// ── GET /invoices?id=X ──
if ($method === 'GET' && $id) {
    $inv = loadInvoice($id);
    if (!$inv) Response::notFound('Invoice not found');

    // Client role: can only see their own invoices
    if ($role === 'client') {
        $clientRecord = DB::row("SELECT id FROM clients WHERE email = ?", [$user['email']]);
        if (!$clientRecord || $inv['client_id'] != $clientRecord['id']) Response::error('Forbidden', 403);
    } else {
        if ($inv['user_id'] != $userId) Response::error('Forbidden', 403);
    }
    Response::success($inv);
}

// ── POST /invoices (create) ──
if ($method === 'POST' && !$id) {
    if (!in_array($role, ['admin', 'staff'])) Response::error('Forbidden', 403);

    $errors = Request::validate([
        'client_id'  => 'required',
        'issue_date' => 'required',
        'due_date'   => 'required',
    ]);
    $items = Request::get('items', []);
    if (empty($items)) $errors['items'][] = 'At least one item is required';
    if ($errors) Response::validationError($errors);

    $subtotal   = 0;
    foreach ($items as $item) {
        $subtotal += (float)($item['quantity'] ?? 0) * (float)($item['unit_price'] ?? 0);
    }
    $taxPercent = (float)Request::get('tax_percent', 0);
    $taxAmount  = $subtotal * ($taxPercent / 100);
    $total      = $subtotal + $taxAmount;

    DB::execute(
        "INSERT INTO invoices
         (user_id, client_id, invoice_number, status, issue_date, due_date,
          subtotal, tax_percent, tax_amount, total, notes, terms, created_at, updated_at)
         VALUES (?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
        [
            $userId,
            (int)Request::get('client_id'),
            generateInvoiceNumber(),
            Request::get('issue_date'),
            Request::get('due_date'),
            round($subtotal, 2),
            $taxPercent,
            round($taxAmount, 2),
            round($total, 2),
            Request::get('notes', ''),
            Request::get('terms', ''),
        ]
    );
    $invoiceId = (int)DB::lastId();

    foreach ($items as $item) {
        $lineTotal = (float)$item['quantity'] * (float)$item['unit_price'];
        DB::execute(
            "INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, subtotal)
             VALUES (?, ?, ?, ?, ?)",
            [$invoiceId, $item['description'], $item['quantity'], $item['unit_price'], round($lineTotal, 2)]
        );
    }

    Response::success(loadInvoice($invoiceId), 201);
}

// ── PUT /invoices?id=X (update) ──
if ($method === 'PUT' && $id) {
    if (!in_array($role, ['admin', 'staff'])) Response::error('Forbidden', 403);

    $inv = DB::row("SELECT * FROM invoices WHERE id = ? AND user_id = ?", [$id, $userId]);
    if (!$inv) Response::notFound('Invoice not found');

    $items      = Request::get('items');
    $subtotal   = (float)$inv['subtotal'];
    $taxPercent = (float)(Request::get('tax_percent') ?? $inv['tax_percent']);

    if ($items) {
        DB::execute("DELETE FROM invoice_items WHERE invoice_id = ?", [$id]);
        $subtotal = 0;
        foreach ($items as $item) {
            $lineTotal = (float)$item['quantity'] * (float)$item['unit_price'];
            $subtotal += $lineTotal;
            DB::execute(
                "INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, subtotal)
                 VALUES (?, ?, ?, ?, ?)",
                [$id, $item['description'], $item['quantity'], $item['unit_price'], round($lineTotal, 2)]
            );
        }
    }

    $taxAmount = $subtotal * ($taxPercent / 100);
    $total     = $subtotal + $taxAmount;

    DB::execute(
        "UPDATE invoices SET
         client_id=?, issue_date=?, due_date=?, subtotal=?, tax_percent=?,
         tax_amount=?, total=?, notes=?, terms=?, status=?, updated_at=NOW()
         WHERE id = ?",
        [
            Request::get('client_id', $inv['client_id']),
            Request::get('issue_date', $inv['issue_date']),
            Request::get('due_date',   $inv['due_date']),
            round($subtotal, 2),
            $taxPercent,
            round($taxAmount, 2),
            round($total, 2),
            Request::get('notes', $inv['notes']),
            Request::get('terms', $inv['terms']),
            Request::get('status', $inv['status']),
            $id
        ]
    );

    Response::success(loadInvoice($id));
}

// ── DELETE /invoices?id=X ──
if ($method === 'DELETE' && $id) {
    Auth::requireRole(['admin']);
    DB::execute("DELETE FROM invoices WHERE id = ? AND user_id = ?", [$id, $userId]);
    Response::success(['message' => 'Invoice deleted']);
}

Response::error('Invalid request', 400);
