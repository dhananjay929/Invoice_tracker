<?php
require_once __DIR__ . '/../../bootstrap.php';

// GET /api/auth/me.php  → return current user
// POST /api/auth/logout.php → logout

$method = Request::method();

if ($method === 'GET') {
    $user = Auth::require();
    Response::success($user);
}

if ($method === 'POST') {
    Auth::require();
    Auth::deleteToken();
    Response::success(['message' => 'Logged out successfully']);
}

Response::error('Method not allowed', 405);
