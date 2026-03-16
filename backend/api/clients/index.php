<?php
require_once __DIR__ . '/../../bootstrap.php';

$method = Request::method();
$user   = Auth::requireRole(['admin', 'staff']);
$userId = (int)$user['id'];

// Get client ID from URL if present: /api/clients/index.php?id=5
$id = (int)Request::query('id', 0);

// ── GET /clients (list) ──
if ($method === 'GET' && !$id) {
    $clients = DB::query(
        "SELECT c.*,
                COUNT(i.id) AS invoices_count,
                COALESCE(SUM(i.total), 0) AS total_billed
         FROM clients c
         LEFT JOIN invoices i ON i.client_id = c.id
         WHERE c.user_id = ?
         GROUP BY c.id
         ORDER BY c.name",
        [$userId]
    );
    Response::success($clients);
}

// ── GET /clients?id=X (single) ──
if ($method === 'GET' && $id) {
    $client = DB::row("SELECT * FROM clients WHERE id = ? AND user_id = ?", [$id, $userId]);
    if (!$client) Response::notFound('Client not found');
    $client['invoices'] = DB::query("SELECT * FROM invoices WHERE client_id = ? ORDER BY created_at DESC", [$id]);
    Response::success($client);
}

// ── POST /clients (create) ──
if ($method === 'POST') {
    $errors = Request::validate(['name' => 'required', 'email' => 'required|email']);
    if ($errors) Response::validationError($errors);

    DB::execute(
        "INSERT INTO clients (user_id, name, email, phone, company_name, address, gst_number, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
        [
            $userId,
            trim(Request::get('name')),
            trim(Request::get('email')),
            trim(Request::get('phone', '')),
            trim(Request::get('company_name', '')),
            trim(Request::get('address', '')),
            trim(Request::get('gst_number', '')),
        ]
    );
    $client = DB::row("SELECT * FROM clients WHERE id = ?", [DB::lastId()]);
    Response::success($client, 201);
}

// ── PUT /clients?id=X (update) ──
if ($method === 'PUT' && $id) {
    $client = DB::row("SELECT id FROM clients WHERE id = ? AND user_id = ?", [$id, $userId]);
    if (!$client) Response::notFound('Client not found');

    DB::execute(
        "UPDATE clients SET name=?, email=?, phone=?, company_name=?, address=?, gst_number=?, updated_at=NOW()
         WHERE id = ?",
        [
            trim(Request::get('name')),
            trim(Request::get('email')),
            trim(Request::get('phone', '')),
            trim(Request::get('company_name', '')),
            trim(Request::get('address', '')),
            trim(Request::get('gst_number', '')),
            $id
        ]
    );
    $updated = DB::row("SELECT * FROM clients WHERE id = ?", [$id]);
    Response::success($updated);
}

// ── DELETE /clients?id=X (admin only) ──
if ($method === 'DELETE' && $id) {
    Auth::requireRole(['admin']);
    DB::execute("DELETE FROM clients WHERE id = ? AND user_id = ?", [$id, $userId]);
    Response::success(['message' => 'Client deleted']);
}

Response::error('Invalid request', 400);
