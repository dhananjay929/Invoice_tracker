<?php
require_once __DIR__ . '/../../bootstrap.php';

$user   = Auth::requireRole(['admin']);
$userId = (int)$user['id'];
$type   = Request::query('type', 'summary');

// ── Summary report ──
if ($type === 'summary') {
    $invoiceCounts = DB::query(
        "SELECT status, COUNT(*) as count, COALESCE(SUM(total),0) as amount FROM invoices WHERE user_id=? GROUP BY status",
        [$userId]
    );
    $byStatus = [];
    foreach ($invoiceCounts as $row) $byStatus[$row['status']] = $row;

    $allTimeRev = (float)DB::row(
        "SELECT COALESCE(SUM(p.amount),0) as t FROM payments p JOIN invoices i ON i.id=p.invoice_id WHERE i.user_id=?",
        [$userId]
    )['t'];
    $thisMonthRev = (float)DB::row(
        "SELECT COALESCE(SUM(p.amount),0) as t FROM payments p JOIN invoices i ON i.id=p.invoice_id
         WHERE i.user_id=? AND MONTH(p.paid_at)=MONTH(NOW()) AND YEAR(p.paid_at)=YEAR(NOW())",
        [$userId]
    )['t'];
    $thisYearRev = (float)DB::row(
        "SELECT COALESCE(SUM(p.amount),0) as t FROM payments p JOIN invoices i ON i.id=p.invoice_id
         WHERE i.user_id=? AND YEAR(p.paid_at)=YEAR(NOW())",
        [$userId]
    )['t'];
    $thisYearExp = (float)DB::row(
        "SELECT COALESCE(SUM(amount),0) as t FROM expenses WHERE user_id=? AND YEAR(expense_date)=YEAR(NOW())",
        [$userId]
    )['t'];

    Response::success([
        'invoices' => [
            'total'          => array_sum(array_column($invoiceCounts, 'count')),
            'paid'           => (int)($byStatus['paid']['count'] ?? 0),
            'sent'           => (int)($byStatus['sent']['count'] ?? 0),
            'draft'          => (int)($byStatus['draft']['count'] ?? 0),
            'overdue'        => (int)($byStatus['overdue']['count'] ?? 0),
            'partially_paid' => (int)($byStatus['partially_paid']['count'] ?? 0),
            'total_amount'   => (float)array_sum(array_column($invoiceCounts, 'amount')),
        ],
        'revenue'  => ['all_time' => $allTimeRev, 'this_month' => $thisMonthRev, 'this_year' => $thisYearRev],
        'expenses' => ['this_year' => $thisYearExp],
    ]);
}

// ── Overdue report ──
if ($type === 'overdue') {
    $invoices = DB::query(
        "SELECT i.*, c.name as client_name, c.email as client_email
         FROM invoices i JOIN clients c ON c.id=i.client_id
         WHERE i.user_id=? AND i.status='overdue' ORDER BY i.due_date",
        [$userId]
    );
    foreach ($invoices as &$inv) {
        $paid = (float)DB::row("SELECT COALESCE(SUM(amount),0) as t FROM payments WHERE invoice_id=?",[$inv['id']])['t'];
        $inv['total_paid']   = $paid;
        $inv['balance_due']  = (float)$inv['total'] - $paid;
        $inv['days_overdue'] = (int)floor((time() - strtotime($inv['due_date'])) / 86400);
    }
    Response::success($invoices);
}

// ── Monthly P&L report ──
if ($type === 'monthly') {
    $year = (int)Request::query('year', date('Y'));
    $revenueRaw = DB::query(
        "SELECT MONTH(p.paid_at) as month, SUM(p.amount) as total
         FROM payments p JOIN invoices i ON i.id=p.invoice_id
         WHERE i.user_id=? AND YEAR(p.paid_at)=? GROUP BY MONTH(p.paid_at)",
        [$userId, $year]
    );
    $expenseRaw = DB::query(
        "SELECT MONTH(expense_date) as month, SUM(amount) as total
         FROM expenses WHERE user_id=? AND YEAR(expense_date)=? GROUP BY MONTH(expense_date)",
        [$userId, $year]
    );
    $rev = array_column($revenueRaw, 'total', 'month');
    $exp = array_column($expenseRaw, 'total', 'month');
    $months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    $data = [];
    for ($m = 1; $m <= 12; $m++) {
        $r = (float)($rev[$m] ?? 0);
        $e = (float)($exp[$m] ?? 0);
        $data[] = ['month' => $months[$m-1], 'revenue' => $r, 'expenses' => $e, 'profit' => $r - $e];
    }
    Response::success(['year' => $year, 'data' => $data]);
}

Response::error('Unknown report type', 400);
