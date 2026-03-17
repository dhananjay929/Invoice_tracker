FROM php:8.2-apache

# Install required extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Disable conflicting MPMs and keep prefork
RUN a2dismod mpm_event || true
RUN a2dismod mpm_worker || true
RUN a2enmod mpm_prefork

# Enable rewrite (optional)
RUN a2enmod rewrite

# Copy backend code
COPY backend/ /var/www/html/