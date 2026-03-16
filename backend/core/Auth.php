<?php

require_once __DIR__ . '/../core/DB.php';
require_once __DIR__ . '/../config/database.php';

class Auth {

    // Generate a secure random token and store it in DB
    public static function createToken(int $userId): string {
        $token = bin2hex(random_bytes(40)); // 80-char hex token
        $expires = date('Y-m-d H:i:s', strtotime('+30 days'));

        // Delete old tokens for this user
        DB::execute("DELETE FROM user_tokens WHERE user_id = ?", [$userId]);

        // Store new token
        DB::execute(
            "INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
            [$userId, hash('sha256', $token), $expires]
        );

        return $token; // Return plain token to client (we store the hash)
    }

    // Validate token from Authorization header, return user array or null
    public static function user(): ?array {
    // Apache sometimes strips Authorization header — check multiple sources
    $header = $_SERVER['HTTP_AUTHORIZATION']
           ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
           ?? apache_request_headers()['Authorization']
           ?? apache_request_headers()['authorization']
           ?? '';

    if (!str_starts_with($header, 'Bearer ')) return null;  

        $token = substr($header, 7);
        $hashed = hash('sha256', $token);

        $row = DB::row(
            "SELECT u.*, t.expires_at
             FROM users u
             JOIN user_tokens t ON t.user_id = u.id
             WHERE t.token = ? AND t.expires_at > NOW()",
            [$hashed]
        );

        if (!$row) return null;
        unset($row['password'], $row['expires_at']);
        return $row;
    }

    // Require auth — dies with 401 if not authenticated
    public static function require(): array {
        $user = self::user();
        if (!$user) {
            http_response_code(401);
            die(json_encode(['message' => 'Unauthenticated. Please login.']));
        }
        return $user;
    }

    // Require specific roles
    public static function requireRole(array $roles): array {
        $user = self::require();
        if (!in_array($user['role'], $roles)) {
            http_response_code(403);
            die(json_encode(['message' => 'Forbidden. Required role: ' . implode(' or ', $roles)]));
        }
        return $user;
    }

    // Hash password
    public static function hashPassword(string $plain): string {
        return password_hash($plain, PASSWORD_BCRYPT);
    }

    // Verify password
    public static function verifyPassword(string $plain, string $hash): bool {
        return password_verify($plain, $hash);
    }

    // Logout - delete token
    public static function deleteToken(): void {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!str_starts_with($header, 'Bearer ')) return;
        $token = substr($header, 7);
        DB::execute("DELETE FROM user_tokens WHERE token = ?", [hash('sha256', $token)]);
    }
}
