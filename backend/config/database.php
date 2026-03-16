<?php
// ============================================================
//  DATABASE CONFIG — Only file you need to edit before setup
// ============================================================

define('DB_HOST',     'localhost');
define('DB_NAME',     'invoice_tracker');
define('DB_USER',     'root');
define('DB_PASS',     '');          // WAMP default is empty
define('DB_CHARSET',  'utf8mb4');

// App settings
define('APP_URL',     'http://localhost/invoice-tracker/backend');
define('APP_NAME',    'InvoTrack');
define('JWT_SECRET',  'CHANGE_THIS_TO_A_RANDOM_STRING_invoice2024!');

// Mail settings (use Mailtrap for testing)
define('MAIL_HOST',     'sandbox.smtp.mailtrap.io');
define('MAIL_PORT',     2525);
define('MAIL_USER',     '');   // Your Mailtrap username
define('MAIL_PASS',     '');   // Your Mailtrap password
define('MAIL_FROM',     'noreply@invoicetracker.com');
define('MAIL_NAME',     'InvoTrack');
