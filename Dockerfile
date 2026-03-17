FROM php:8.2-apache

# Install required PHP extensions (optional but recommended)
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Copy backend code
COPY backend/ /var/www/html/

# Enable Apache mod_rewrite (optional)
RUN a2enmod rewrite