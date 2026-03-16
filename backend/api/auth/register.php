<?php
require_once __DIR__ . '/../../bootstrap.php';

if (Request::method() !== 'POST') Response::error('Method not allowed', 405);

$errors = Request::validate([
    'name'     => 'required',
    'email'    => 'required|email',
    'password' => 'required|min:8',
]);
if ($errors) Response::validationError($errors);

$name         = trim(Request::get('name'));
$email        = strtolower(trim(Request::get('email')));
$password     = Request::get('password');
$company_name = trim(Request::get('company_name', ''));
$phone        = trim(Request::get('phone', ''));
$role         = Request::get('role', 'admin');
if (!in_array($role, ['admin', 'staff'])) $role = 'admin';

// Check duplicate email
$exists = DB::row("SELECT id FROM users WHERE email = ?", [$email]);
if ($exists) Response::validationError(['email' => ['Email already registered']]);

// Insert user
DB::execute(
    "INSERT INTO users (name, email, password, role, company_name, phone, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
    [$name, $email, Auth::hashPassword($password), $role, $company_name, $phone]
);

$userId = DB::lastId();
$user   = DB::row("SELECT id, name, email, role, company_name, phone FROM users WHERE id = ?", [$userId]);
$token  = Auth::createToken((int)$userId);

Response::success(['user' => $user, 'token' => $token], 201);
