<?php
/**
 * Overdue Invoice Reminder Cron Script
 *
 * Add to crontab (runs daily at 9 AM):
 * 0 9 * * * php C:/Server/www/invoice-tracker/backend/cron/send_reminders.php
 *
 * Or run manually: php cron/send_reminders.php
 */

// Load bootstrap without CORS headers (CLI doesn't need them)
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/DB.php';
require_once __DIR__ . '/../helpers/mailer.php';

echo "[" . date('Y-m-d H:i:s') . "] Starting overdue reminder job...\n";

// Step 1: Mark sent invoices as overdue if past due date
$updated = DB::execute(
    "UPDATE invoices SET status = 'overdue', updated_at = NOW()
     WHERE status = 'sent' AND due_date < CURDATE()"
);
echo "Marked $updated invoices as overdue.\n";

// Step 2: Fetch all overdue invoices with client and sender info
$invoices = DB::query(
    "SELECT i.*,
            c.name  as client_name,
            c.email as client_email,
            u.name  as sender_name,
            u.company_name as sender_company,
            u.email as sender_email
     FROM invoices i
     JOIN clients c ON c.id = i.client_id
     JOIN users   u ON u.id = i.user_id
     WHERE i.status = 'overdue'"
);

echo "Found " . count($invoices) . " overdue invoices.\n";

// Step 3: Send reminder for each
foreach ($invoices as $inv) {
    // Calculate days overdue and balance due
    $inv['days_overdue'] = (int)floor((time() - strtotime($inv['due_date'])) / 86400);
    $paid = (float)DB::row(
        "SELECT COALESCE(SUM(amount), 0) as t FROM payments WHERE invoice_id = ?",
        [$inv['id']]
    )['t'];
    $inv['balance_due'] = (float)$inv['total'] - $paid;

    $result = Mailer::sendOverdueReminder($inv);
    if ($result) {
        echo "  ✓ Reminder sent: {$inv['invoice_number']} → {$inv['client_email']}\n";
    } else {
        echo "  ✗ Failed: {$inv['invoice_number']} → {$inv['client_email']}\n";
    }
}

echo "[" . date('Y-m-d H:i:s') . "] Done.\n";
