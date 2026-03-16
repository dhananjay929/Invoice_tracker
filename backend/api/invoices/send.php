<?php
require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../helpers/mailer.php';

if (Request::method() !== 'POST') Response::error('Method not allowed', 405);

$user   = Auth::requireRole(['admin', 'staff']);
$id     = (int)Request::query('id', 0);
if (!$id) Response::error('Invoice ID required', 400);

$inv = DB::row(
    "SELECT i.*, c.name as client_name, c.email as client_email,
            c.company_name as client_company,
            u.name as sender_name, u.company_name as sender_company, u.email as sender_email
     FROM invoices i
     JOIN clients c ON c.id = i.client_id
     JOIN users   u ON u.id = i.user_id
     WHERE i.id = ? AND i.user_id = ?",
    [$id, $user['id']]
);
if (!$inv) Response::notFound('Invoice not found');

$inv['items'] = DB::query("SELECT * FROM invoice_items WHERE invoice_id = ?", [$id]);

$sent = Mailer::sendInvoice($inv);

if ($sent) {
    DB::execute("UPDATE invoices SET status = 'sent', updated_at = NOW() WHERE id = ?", [$id]);
    Response::success(['message' => 'Invoice sent to ' . $inv['client_email']]);
} else {
    Response::error('Failed to send email. Check mail settings in config/database.php', 500);
}
