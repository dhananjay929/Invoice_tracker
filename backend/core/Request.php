<?php

class Request {
    private static ?array $body = null;

    // Get parsed JSON body
    public static function body(): array {
        if (self::$body === null) {
            $raw = file_get_contents('php://input');
            self::$body = json_decode($raw, true) ?? [];
        }
        return self::$body;
    }

    // Get single field from body
    public static function get(string $key, mixed $default = null): mixed {
        return self::body()[$key] ?? $default;
    }

    // Get query string param
    public static function query(string $key, mixed $default = null): mixed {
        return $_GET[$key] ?? $default;
    }

    // Get HTTP method
    public static function method(): string {
        return strtoupper($_SERVER['REQUEST_METHOD']);
    }

    // Simple validation — returns array of errors (empty = valid)
    public static function validate(array $rules): array {
        $body   = self::body();
        $errors = [];

        foreach ($rules as $field => $ruleStr) {
            $rules_list = explode('|', $ruleStr);
            $value = $body[$field] ?? null;

            foreach ($rules_list as $rule) {
                if ($rule === 'required' && ($value === null || $value === '')) {
                    $errors[$field][] = "$field is required";
                }
                if (str_starts_with($rule, 'min:') && $value !== null) {
                    $min = (int) substr($rule, 4);
                    if (strlen((string)$value) < $min)
                        $errors[$field][] = "$field must be at least $min characters";
                }
                if ($rule === 'email' && $value && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $errors[$field][] = "$field must be a valid email";
                }
                if ($rule === 'numeric' && $value !== null && !is_numeric($value)) {
                    $errors[$field][] = "$field must be a number";
                }
                if (str_starts_with($rule, 'in:') && $value !== null) {
                    $allowed = explode(',', substr($rule, 3));
                    if (!in_array($value, $allowed))
                        $errors[$field][] = "$field must be one of: " . implode(', ', $allowed);
                }
            }
        }

        return $errors;
    }
}
