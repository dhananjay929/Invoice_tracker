<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background:#f3f4f6;font-family:Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
  <div style="background:#1e3a8a;padding:32px;text-align:center;color:#fff">
    <h1 style="margin:0;font-size:20px">Invoice from <?= htmlspecialchars($inv['sender_company'] ?: $inv['sender_name']) ?></h1>
    <p style="margin:6px 0 0;opacity:0.8;font-size:13px"><?= htmlspecialchars($inv['invoice_number']) ?></p>
  </div>
  <div style="padding:32px">
    <p style="font-size:14px;color:#374151;margin-bottom:20px">
      Dear <?= htmlspecialchars($inv['client_name']) ?>,<br><br>
      Please find your invoice below. Payment is due by <strong><?= date('d M Y', strtotime($inv['due_date'])) ?></strong>.
    </p>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;text-align:center;margin:20px 0">
      <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px">Amount Due</div>
      <div style="font-size:28px;font-weight:800;color:#1e3a8a;margin-top:4px">₹<?= number_format($inv['total'], 2) ?></div>
    </div>
    <table style="width:100%;font-size:13px">
      <tr style="border-bottom:1px solid #f3f4f6"><td style="padding:6px 0;color:#6b7280">Invoice</td><td style="text-align:right;font-weight:600"><?= htmlspecialchars($inv['invoice_number']) ?></td></tr>
      <tr style="border-bottom:1px solid #f3f4f6"><td style="padding:6px 0;color:#6b7280">Issue Date</td><td style="text-align:right"><?= date('d M Y', strtotime($inv['issue_date'])) ?></td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Due Date</td><td style="text-align:right"><?= date('d M Y', strtotime($inv['due_date'])) ?></td></tr>
    </table>
    <?php if ($inv['notes']): ?>
    <p style="margin-top:20px;font-size:13px;color:#6b7280"><?= htmlspecialchars($inv['notes']) ?></p>
    <?php endif ?>
  </div>
  <div style="background:#f9fafb;padding:16px;text-align:center;font-size:11px;color:#9ca3af">
    Sent by <?= htmlspecialchars($inv['sender_company'] ?: $inv['sender_name']) ?> via InvoTrack
  </div>
</div>
</body>
</html>
