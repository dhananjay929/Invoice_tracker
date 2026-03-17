FROM php:8.2-cli

# force rebuild

RUN docker-php-ext-install mysqli pdo pdo_mysql

WORKDIR /app

COPY backend/ /app

CMD ["/bin/sh", "-c", "echo PORT=$PORT && php -S 0.0.0.0:$PORT index.php"]