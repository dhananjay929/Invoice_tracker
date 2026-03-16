<?php
require_once __DIR__ . '/../../bootstrap.php';

$method = Request::method();
$user   = Auth::requireRole(['admin', 'staff']);
$userId = (int)$user['id'];
$id     = (int)Request::query('id', 0);

// ── GET expenses ──
if ($method === 'GET' && !$id) {
    $where  = "WHERE user_id = ?";
    $params = [$userId];

    if ($cat = Request::query('category')) {
        $where   .= " AND category = ?";
        $params[] = $cat;
    }
    if ($from = Request::query('from')) {
        $where   .= " AND expense_date >= ?";
        $params[] = $from;
    }
    if ($to = Request::query('to')) {
        $where   .= " AND expense_date <= ?";
        $params[] = $to;
    }

    $expenses = DB::query("SELECT * FROM expenses $where ORDER BY expense_date DESC", $params);
    Response::success($expenses);
}

// ── POST create expense ──
if ($method === 'POST') {
    $errors = Request::validate([
        'category'     => 'required',
        'amount'       => 'required|numeric',
        'description'  => 'required',
        'expense_date' => 'required',
    ]);
    if ($errors) Response::validationError($errors);

    DB::execute(
        "INSERT INTO expenses (user_id, category, amount, description, expense_date, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
        [
            $userId,
            Request::get('category'),
            (float)Request::get('amount'),
            Request::get('description'),
            Request::get('expense_date'),
        ]
    );
    $expense = DB::row("SELECT * FROM expenses WHERE id = ?", [DB::lastId()]);
    Response::success($expense, 201);
}

// ── PUT update expense ──
if ($method === 'PUT' && $id) {
    $exp = DB::row("SELECT id FROM expenses WHERE id = ? AND user_id = ?", [$id, $userId]);
    if (!$exp) Response::notFound('Expense not found');

    DB::execute(
        "UPDATE expenses SET category=?, amount=?, description=?, expense_date=?, updated_at=NOW() WHERE id=?",
        [
            Request::get('category'),
            (float)Request::get('amount'),
            Request::get('description'),
            Request::get('expense_date'),
            $id
        ]
    );
    Response::success(DB::row("SELECT * FROM expenses WHERE id = ?", [$id]));
}

// ── DELETE expense (admin only) ──
if ($method === 'DELETE' && $id) {
    Auth::requireRole(['admin']);
    DB::execute("DELETE FROM expenses WHERE id = ? AND user_id = ?", [$id, $userId]);
    Response::success(['message' => 'Expense deleted']);
}

Response::error('Invalid request', 400);
