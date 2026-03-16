<?php
require_once __DIR__ . '/../../bootstrap.php';

$user   = Auth::require();
$userId = (int)$user['id'];

$totalInvoiced = (float)DB::row("SELECT COALESCE(SUM(total),0) as t FROM invoices WHERE user_id=?",[$userId])['t'];
$totalPaid     = (float)DB::row(
    "SELECT COALESCE(SUM(p.amount),0) as t FROM payments p JOIN invoices i ON i.id=p.invoice_id WHERE i.user_id=?",
    [$userId]
)['t'];
$thisMonthExp  = (float)DB::row(
    "SELECT COALESCE(SUM(amount),0) as t FROM expenses WHERE user_id=? AND MONTH(expense_date)=MONTH(NOW()) AND YEAR(expense_date)=YEAR(NOW())",
    [$userId]
)['t'];
$overdueCount = (int)DB::row("SELECT COUNT(*) as c FROM invoices WHERE user_id=? AND status='overdue'",[$userId])['c'];
$draftCount   = (int)DB::row("SELECT COUNT(*) as c FROM invoices WHERE user_id=? AND status='draft'",[$userId])['c'];
$clientCount  = (int)DB::row("SELECT COUNT(*) as c FROM clients WHERE user_id=?",[$userId])['c'];

$recentInvoices = DB::query(
    "SELECT i.*, c.name as client_name, c.company_name as client_company
     FROM invoices i JOIN clients c ON c.id=i.client_id
     WHERE i.user_id=? ORDER BY i.created_at DESC LIMIT 5",
    [$userId]
);
$recentExpenses = DB::query(
    "SELECT * FROM expenses WHERE user_id=? ORDER BY expense_date DESC LIMIT 5",
    [$userId]
);

// Monthly revenue for current year
$monthlyRaw = DB::query(
    "SELECT MONTH(p.paid_at) as month, SUM(p.amount) as total
     FROM payments p JOIN invoices i ON i.id=p.invoice_id
     WHERE i.user_id=? AND YEAR(p.paid_at)=YEAR(NOW())
     GROUP BY MONTH(p.paid_at)",
    [$userId]
);
$byMonth = array_column($monthlyRaw, 'total', 'month');
$months  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
$chartData = [];
for ($m = 1; $m <= 12; $m++) {
    $chartData[] = ['month' => $months[$m-1], 'revenue' => (float)($byMonth[$m] ?? 0)];
}

Response::success([
    'stats' => [
        'total_invoiced' => $totalInvoiced,
        'total_paid'     => $totalPaid,
        'outstanding'    => $totalInvoiced - $totalPaid,
        'total_expenses' => $thisMonthExp,
        'overdue_count'  => $overdueCount,
        'draft_count'    => $draftCount,
        'total_clients'  => $clientCount,
    ],
    'recent_invoices' => $recentInvoices,
    'recent_expenses' => $recentExpenses,
    'monthly_revenue' => $chartData,
]);
