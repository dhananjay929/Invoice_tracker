<?php

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Mailer {

    private static function make(): PHPMailer {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = MAIL_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = MAIL_USER;
        $mail->Password   = MAIL_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = MAIL_PORT;
        $mail->CharSet    = 'UTF-8';
        $mail->setFrom(MAIL_FROM, MAIL_NAME);
        return $mail;
    }

    // Send invoice to client
    public static function sendInvoice(array $inv): bool {
        try {
            $mail = self::make();
            $mail->addAddress($inv['client_email'], $inv['client_name']);
            $mail->isHTML(true);
            $mail->Subject = 'Invoice ' . $inv['invoice_number'] . ' from ' . ($inv['sender_company'] ?: $inv['sender_name']);

            ob_start();
            include __DIR__ . '/../templates/email/invoice.php';
            $body = ob_get_clean();

            $mail->Body    = $body;
            $mail->AltBody = 'Invoice ' . $inv['invoice_number'] . ' — Amount: ₹' . number_format($inv['total'], 2) . ' — Due: ' . $inv['due_date'];
            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log('Mailer error: ' . $e->getMessage());
            return false;
        }
    }

    // Send overdue reminder
    public static function sendOverdueReminder(array $inv): bool {
        try {
            $mail = self::make();
            $mail->addAddress($inv['client_email'], $inv['client_name']);
            $mail->isHTML(true);
            $mail->Subject = 'Payment Reminder: Invoice ' . $inv['invoice_number'] . ' is Overdue';

            ob_start();
            include __DIR__ . '/../templates/email/overdue.php';
            $body = ob_get_clean();

            $mail->Body    = $body;
            $mail->AltBody = 'Invoice ' . $inv['invoice_number'] . ' is overdue. Balance due: ₹' . number_format($inv['balance_due'], 2);
            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log('Mailer error: ' . $e->getMessage());
            return false;
        }
    }
}
