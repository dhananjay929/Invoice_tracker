FROM php:8.2-cli

# Install extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

WORKDIR /app

COPY backend/ /app

CMD php -S 0.0.0.0:$PORT index.php