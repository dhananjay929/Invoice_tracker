<?php
// ============================================================
//  DATABASE CONFIG — reads from environment variables
// ============================================================

define('DB_HOST',     $_ENV['MYSQLHOST']     ?? getenv('MYSQLHOST')     ?? 'localhost');
define('DB_NAME',     $_ENV['MYSQL_DATABASE'] ?? getenv('MYSQL_DATABASE') ?? 'railway');
define('DB_USER',     $_ENV['MYSQLUSER']     ?? getenv('MYSQLUSER')     ?? 'root');
define('DB_PASS',     $_ENV['MYSQLPASSWORD'] ?? getenv('MYSQLPASSWORD') ?? '');
define('DB_PORT',     $_ENV['MYSQLPORT']     ?? getenv('MYSQLPORT')     ?? '3306');
define('DB_CHARSET',  'utf8mb4');

// App settings
define('APP_URL',    $_ENV['APP_URL']    ?? getenv('APP_URL')    ?? 'http://localhost:8080');
define('APP_NAME',   'InvoTrack');
define('JWT_SECRET', $_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET') ?? 'change_this_locally');

// Mail settings
define('MAIL_HOST', $_ENV['MAIL_HOST'] ?? getenv('MAIL_HOST') ?? 'sandbox.smtp.mailtrap.io');
define('MAIL_PORT', $_ENV['MAIL_PORT'] ?? getenv('MAIL_PORT') ?? 2525);
define('MAIL_USER', $_ENV['MAIL_USER'] ?? getenv('MAIL_USER') ?? '');
define('MAIL_PASS', $_ENV['MAIL_PASS'] ?? getenv('MAIL_PASS') ?? '');
define('MAIL_FROM', $_ENV['MAIL_FROM'] ?? getenv('MAIL_FROM') ?? 'noreply@invoicetracker.com');
define('MAIL_NAME', 'InvoTrack');