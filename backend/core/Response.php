<?php

class Response {

    public static function json(mixed $data, int $status = 200): void {
        http_response_code($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success(mixed $data, int $status = 200): void {
        self::json($data, $status);
    }

    public static function error(string $message, int $status = 400): void {
        self::json(['message' => $message], $status);
    }

    public static function notFound(string $message = 'Not found'): void {
        self::json(['message' => $message], 404);
    }

    public static function validationError(array $errors): void {
        self::json(['message' => 'Validation failed', 'errors' => $errors], 422);
    }
}
