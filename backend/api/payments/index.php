<?php
require_once __DIR__ . '/../../bootstrap.php';

$method    = Request::method();
$user      = Auth::requireRole(['admin', 'staff']);
$invoiceId = (int)Request::query('invoice_id', 0);
if (!$invoiceId) Response::error('invoice_id is required', 400);

// Verify invoice belongs to this user
$inv = DB::row("SELECT * FROM invoices WHERE id = ? AND user_id = ?", [$invoiceId, $user['id']]);
if (!$inv) Response::notFound('Invoice not found');

// ── GET payments for invoice ──
if ($method === 'GET') {
    $payments = DB::query(
        "SELECT * FROM payments WHERE invoice_id = ? ORDER BY paid_at DESC",
        [$invoiceId]
    );
    Response::success($payments);
}

// ── POST record a payment ──
if ($method === 'POST') {
    $errors = Request::validate([
        'amount'  => 'required|numeric',
        'paid_at' => 'required',
        'method'  => 'required|in:cash,bank_transfer,upi,cheque,card,other',
    ]);
    if ($errors) Response::validationError($errors);

    DB::execute(
        "INSERT INTO payments (invoice_id, amount, paid_at, method, reference, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
        [
            $invoiceId,
            (float)Request::get('amount'),
            Request::get('paid_at'),
            Request::get('method'),
            Request::get('reference', ''),
            Request::get('notes', ''),
        ]
    );

    // Recalculate invoice status
    $totalPaid = (float)DB::row(
        "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE invoice_id = ?",
        [$invoiceId]
    )['total'];

    $newStatus = $inv['status'];
    if ($totalPaid >= (float)$inv['total']) {
        $newStatus = 'paid';
    } elseif ($totalPaid > 0) {
        $newStatus = 'partially_paid';
    }
    DB::execute("UPDATE invoices SET status = ?, updated_at = NOW() WHERE id = ?", [$newStatus, $invoiceId]);

    $payment = DB::row("SELECT * FROM payments WHERE id = ?", [DB::lastId()]);
    Response::success([
        'payment'        => $payment,
        'invoice_status' => $newStatus,
        'balance_due'    => (float)$inv['total'] - $totalPaid,
    ], 201);
}

Response::error('Method not allowed', 405);
