<?php
// $inv is available from pdf.php — contains all invoice data
$statusColors = [
    'paid'           => '#065f46',
    'sent'           => '#1e40af',
    'overdue'        => '#991b1b',
    'draft'          => '#374151',
    'partially_paid' => '#92400e',
];
$statusBg = [
    'paid'           => '#d1fae5',
    'sent'           => '#dbeafe',
    'overdue'        => '#fee2e2',
    'draft'          => '#f3f4f6',
    'partially_paid' => '#fef3c7',
];
$sc = $statusColors[$inv['status']] ?? '#374151';
$sb = $statusBg[$inv['status']]    ?? '#f3f4f6';
?>
<style>
  body { font-family: helvetica; font-size: 11px; color: #1a1a2e; }
  .header { margin-bottom: 20px; }
  .company { font-size: 18px; font-weight: bold; color: #2563eb; }
  .invoice-title { font-size: 28px; font-weight: bold; color: #1e3a8a; text-align: right; }
  .inv-num { font-size: 12px; color: #6b7280; text-align: right; margin-top: 2px; }
  .status-badge { display: inline-block; padding: 2px 10px; border-radius: 10px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
  .divider { border-top: 2px solid #e5e7eb; margin: 12px 0; }
  .meta-table { width: 100%; margin-bottom: 20px; }
  .meta-label { font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; padding-bottom: 4px; }
  .meta-value { font-size: 11px; color: #111827; line-height: 1.6; }
  table.items { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  table.items thead tr { background-color: #1e3a8a; color: #ffffff; }
  table.items thead th { padding: 8px 10px; font-size: 10px; text-align: left; }
  table.items tbody td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; font-size: 10px; }
  table.items tbody tr:nth-child(even) td { background-color: #f8fafc; }
  .totals-table { width: 240px; float: right; }
  .totals-table td { padding: 5px 8px; font-size: 11px; }
  .grand-total { font-size: 13px; font-weight: bold; color: #1e3a8a; border-top: 2px solid #1e3a8a; }
  .notes-box { background: #f8fafc; padding: 10px; border-left: 3px solid #2563eb; margin-top: 20px; }
  .notes-label { font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 4px; }
  .footer { text-align: center; font-size: 9px; color: #9ca3af; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 10px; }
</style>

<table class="header" width="100%">
  <tr>
    <td width="60%">
      <div class="company"><?= htmlspecialchars($inv['sender_company'] ?: $inv['sender_name']) ?></div>
      <div style="font-size:10px; color:#6b7280; margin-top:4px; line-height:1.6">
        <?= htmlspecialchars($inv['sender_email']) ?><br>
        <?php if ($inv['sender_phone']): ?><?= htmlspecialchars($inv['sender_phone']) ?><?php endif ?>
      </div>
    </td>
    <td width="40%" align="right">
      <div class="invoice-title">INVOICE</div>
      <div class="inv-num"><?= htmlspecialchars($inv['invoice_number']) ?></div>
      <div style="margin-top:4px; text-align:right;">
        <span class="status-badge" style="background:<?= $sb ?>; color:<?= $sc ?>">
          <?= strtoupper(str_replace('_', ' ', $inv['status'])) ?>
        </span>
      </div>
    </td>
  </tr>
</table>

<div class="divider"></div>

<table class="meta-table">
  <tr>
    <td width="50%" valign="top">
      <div class="meta-label">Bill To</div>
      <div class="meta-value">
        <strong><?= htmlspecialchars($inv['client_name']) ?></strong><br>
        <?php if ($inv['client_company']): ?><?= htmlspecialchars($inv['client_company']) ?><br><?php endif ?>
        <?= htmlspecialchars($inv['client_email']) ?><br>
        <?php if ($inv['client_phone']): ?><?= htmlspecialchars($inv['client_phone']) ?><br><?php endif ?>
        <?php if ($inv['client_address']): ?><?= htmlspecialchars($inv['client_address']) ?><?php endif ?>
      </div>
    </td>
    <td width="50%" valign="top">
      <div class="meta-label">Invoice Details</div>
      <div class="meta-value">
        <strong>Issue Date:</strong> <?= date('d M Y', strtotime($inv['issue_date'])) ?><br>
        <strong>Due Date:</strong> <?= date('d M Y', strtotime($inv['due_date'])) ?><br>
        <?php if ($inv['client_gst']): ?><strong>GST No:</strong> <?= htmlspecialchars($inv['client_gst']) ?><?php endif ?>
      </div>
    </td>
  </tr>
</table>

<table class="items">
  <thead>
    <tr>
      <th width="5%">#</th>
      <th width="55%">Description</th>
      <th width="10%" align="right">Qty</th>
      <th width="15%" align="right">Unit Price</th>
      <th width="15%" align="right">Amount</th>
    </tr>
  </thead>
  <tbody>
    <?php foreach ($inv['items'] as $i => $item): ?>
    <tr>
      <td><?= $i + 1 ?></td>
      <td><?= htmlspecialchars($item['description']) ?></td>
      <td align="right"><?= $item['quantity'] ?></td>
      <td align="right">₹<?= number_format($item['unit_price'], 2) ?></td>
      <td align="right">₹<?= number_format($item['subtotal'], 2) ?></td>
    </tr>
    <?php endforeach ?>
  </tbody>
</table>

<table class="totals-table" align="right">
  <tr><td>Subtotal</td><td align="right">₹<?= number_format($inv['subtotal'], 2) ?></td></tr>
  <?php if ($inv['tax_percent'] > 0): ?>
  <tr><td>Tax (<?= $inv['tax_percent'] ?>%)</td><td align="right">₹<?= number_format($inv['tax_amount'], 2) ?></td></tr>
  <?php endif ?>
  <tr class="grand-total"><td><strong>Total</strong></td><td align="right"><strong>₹<?= number_format($inv['total'], 2) ?></strong></td></tr>
  <?php if ($inv['total_paid'] > 0): ?>
  <tr style="color:#065f46"><td>Amount Paid</td><td align="right">- ₹<?= number_format($inv['total_paid'], 2) ?></td></tr>
  <tr style="color:#991b1b; font-weight:bold"><td>Balance Due</td><td align="right">₹<?= number_format($inv['balance_due'], 2) ?></td></tr>
  <?php endif ?>
</table>

<br style="clear:both">

<?php if ($inv['notes'] || $inv['terms']): ?>
<div class="notes-box">
  <?php if ($inv['notes']): ?>
  <div class="notes-label">Notes</div>
  <p style="margin:0 0 6px; font-size:10px"><?= htmlspecialchars($inv['notes']) ?></p>
  <?php endif ?>
  <?php if ($inv['terms']): ?>
  <div class="notes-label">Terms &amp; Conditions</div>
  <p style="margin:0; font-size:10px"><?= htmlspecialchars($inv['terms']) ?></p>
  <?php endif ?>
</div>
<?php endif ?>

<div class="footer">
  Generated by InvoTrack &bull; <?= date('d M Y') ?>
</div>
