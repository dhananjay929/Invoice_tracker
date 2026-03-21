<?php

// Handle CORS preflight OPTIONS request FIRST before anything else
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (preg_match('/^https:\/\/.*\.vercel\.app$/', $origin) || $origin === 'http://localhost:5173') {
        header("Access-Control-Allow-Origin: $origin");
    }
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, Accept");
    header("Access-Control-Allow-Credentials: true");
    http_response_code(200);
    exit;
}

// Route all requests to the correct API file
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/');

// Strip .php extension if present
$uri = preg_replace('/\.php$/', '', $uri);

$routes = [
    '/api/auth/login'    => __DIR__ . '/api/auth/login.php',
    '/api/auth/register' => __DIR__ . '/api/auth/register.php',
    '/api/auth/me'       => __DIR__ . '/api/auth/me.php',
    '/api/clients'       => __DIR__ . '/api/clients/index.php',
    '/api/invoices'      => __DIR__ . '/api/invoices/index.php',
    '/api/invoices/pdf'  => __DIR__ . '/api/invoices/pdf.php',
    '/api/invoices/send' => __DIR__ . '/api/invoices/send.php',
    '/api/payments'      => __DIR__ . '/api/payments/index.php',
    '/api/expenses'      => __DIR__ . '/api/expenses/index.php',
    '/api/reports'       => __DIR__ . '/api/reports/index.php',
    '/api/dashboard'     => __DIR__ . '/api/dashboard/index.php',
];

if ($uri === '' || $uri === '/') {
    echo json_encode(['status' => 'ok', 'message' => 'InvoTrack API running']);
    exit;
}

if (isset($routes[$uri])) {
    require $routes[$uri];
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Route not found: ' . $uri]);
}