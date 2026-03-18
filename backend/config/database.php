<?php
// ============================================================
//  DATABASE CONFIG — Only file you need to edit before setup
// ============================================================

define('DB_HOST',     'turntable.proxy.rlwy.net');
define('DB_NAME',     'railway');
define('DB_USER',     'root');
define('DB_PASS',     'OkyiyyvEUDztwdbMmmxdwbAzpUWevKoj');          
define('DB_PORT',     '32592');          
define('DB_CHARSET',  'utf8mb4');

// App settings
define('APP_URL',     'https://invoicetracker-production.up.railway.app/');
define('APP_NAME',    'InvoTrack');
define('JWT_SECRET',  'this_is_top_secret_invoice2026!');

// Mail settings (use Mailtrap for testing)
define('MAIL_HOST',     'sandbox.smtp.mailtrap.io');
define('MAIL_PORT',     2525);
define('MAIL_USER',     '');   // Your Mailtrap username
define('MAIL_PASS',     '');   // Your Mailtrap password
define('MAIL_FROM',     'noreply@invoicetracker.com');
define('MAIL_NAME',     'InvoTrack');
