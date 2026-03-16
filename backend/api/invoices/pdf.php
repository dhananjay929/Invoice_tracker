<?php
require_once __DIR__ . '/../../bootstrap.php';

// Override content type for PDF download
header('Content-Type: application/pdf');

$user = Auth::require();
$id   = (int)Request::query('id', 0);
if (!$id) { header('Content-Type: application/json'); Response::error('Invoice ID required', 400); }

$inv = DB::row(
    "SELECT i.*, c.name as client_name, c.email as client_email,
            c.phone as client_phone, c.company_name as client_company,
            c.address as client_address, c.gst_number as client_gst,
            u.name as sender_name, u.company_name as sender_company,
            u.email as sender_email, u.phone as sender_phone
     FROM invoices i
     JOIN clients c ON c.id = i.client_id
     JOIN users   u ON u.id = i.user_id
     WHERE i.id = ?",
    [$id]
);
if (!$inv) { header('Content-Type: application/json'); Response::notFound('Invoice not found'); }

// Access check
if ($user['role'] === 'client') {
    $cr = DB::row("SELECT id FROM clients WHERE email = ?", [$user['email']]);
    if (!$cr || $inv['client_id'] != $cr['id']) { header('Content-Type: application/json'); Response::error('Forbidden', 403); }
} else {
    if ($inv['user_id'] != $user['id']) { header('Content-Type: application/json'); Response::error('Forbidden', 403); }
}

$inv['items']    = DB::query("SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id", [$id]);
$inv['payments'] = DB::query("SELECT * FROM payments WHERE invoice_id = ? ORDER BY paid_at DESC", [$id]);
$inv['total_paid']  = array_sum(array_column($inv['payments'], 'amount'));
$inv['balance_due'] = $inv['total'] - $inv['total_paid'];

// ── Generate PDF with TCPDF ──
require_once __DIR__ . '/../../vendor/autoload.php';

$pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
$pdf->SetCreator('InvoTrack');
$pdf->SetAuthor($inv['sender_company'] ?: $inv['sender_name']);
$pdf->SetTitle('Invoice ' . $inv['invoice_number']);
$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);
$pdf->SetMargins(15, 15, 15);
$pdf->AddPage();
$pdf->SetFont('helvetica', '', 10);

// Build HTML for PDF
ob_start();
include __DIR__ . '/../../templates/pdf/invoice.php';
$html = ob_get_clean();

$pdf->writeHTML($html, true, false, true, false, '');
$pdf->Output('Invoice-' . $inv['invoice_number'] . '.pdf', 'D');
