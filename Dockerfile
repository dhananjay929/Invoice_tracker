FROM php:8.2-cli

RUN docker-php-ext-install mysqli pdo pdo_mysql

WORKDIR /app

COPY backend/ /app

CMD ["/bin/sh", "-c", "php -S 0.0.0.0:$PORT index.php"]