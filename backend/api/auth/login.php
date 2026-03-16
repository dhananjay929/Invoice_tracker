<?php
require_once __DIR__ . '/../../bootstrap.php';

if (Request::method() !== 'POST') Response::error('Method not allowed', 405);

$errors = Request::validate(['email' => 'required|email', 'password' => 'required']);
if ($errors) Response::validationError($errors);

$email    = strtolower(trim(Request::get('email')));
$password = Request::get('password');

$user = DB::row("SELECT * FROM users WHERE email = ?", [$email]);

if (!$user || !Auth::verifyPassword($password, $user['password'])) {
    Response::error('Invalid email or password', 401);
}

$token = Auth::createToken((int)$user['id']);

unset($user['password']);
Response::success(['user' => $user, 'token' => $token]);
