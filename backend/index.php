<?php

// Enable errors for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Simple router
$request = $_SERVER['REQUEST_URI'];

// Remove query string
$request = strtok($request, '?');

// Route to API
$path = __DIR__ . '/api' . $request;

if (file_exists($path)) {
    require $path;
} elseif (file_exists($path . '/index.php')) {
    require $path . '/index.php';
} else {
    http_response_code(404);
    echo "404 Not Found";
}