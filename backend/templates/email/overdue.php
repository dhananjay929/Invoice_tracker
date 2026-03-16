<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background:#f3f4f6;font-family:Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
  <div style="background:#dc2626;padding:32px;text-align:center;color:#fff">
    <h1 style="margin:0;font-size:20px">Payment Overdue</h1>
    <p style="margin:6px 0 0;opacity:0.85;font-size:13px"><?= htmlspecialchars($inv['invoice_number']) ?></p>
  </div>
  <div style="padding:32px">
    <p style="font-size:14px;color:#374151;margin-bottom:16px">
      Dear <?= htmlspecialchars($inv['client_name']) ?>,<br><br>
      This is a reminder that the invoice below is past its due date. Please arrange payment at your earliest convenience.
    </p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:20px;text-align:center;margin:16px 0">
      <div style="font-size:32px;font-weight:800;color:#dc2626"><?= $inv['days_overdue'] ?> days</div>
      <div style="font-size:12px;color:#6b7280;margin-top:4px">Overdue</div>
    </div>
    <div style="background:#f9fafb;border-radius:8px;padding:16px">
      <table style="width:100%;font-size:13px">
        <tr><td style="color:#6b7280;padding:5px 0">Invoice</td><td style="text-align:right;font-weight:600"><?= htmlspecialchars($inv['invoice_number']) ?></td></tr>
        <tr><td style="color:#6b7280;padding:5px 0">Original Due Date</td><td style="text-align:right"><?= date('d M Y', strtotime($inv['due_date'])) ?></td></tr>
        <tr><td style="color:#6b7280;padding:5px 0">Balance Due</td><td style="text-align:right;font-size:16px;font-weight:800;color:#dc2626">₹<?= number_format($inv['balance_due'], 2) ?></td></tr>
      </table>
    </div>
    <p style="font-size:13px;color:#6b7280;margin-top:16px">
      Please contact <?= htmlspecialchars($inv['sender_company'] ?: $inv['sender_name']) ?> at <?= htmlspecialchars($inv['sender_email']) ?> if you have any questions.
    </p>
  </div>
  <div style="background:#f9fafb;padding:16px;text-align:center;font-size:11px;color:#9ca3af">
    Sent by InvoTrack on behalf of <?= htmlspecialchars($inv['sender_company'] ?: $inv['sender_name']) ?>
  </div>
</div>
</body>
</html>
