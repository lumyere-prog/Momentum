FROM serversideup/php:8.4-fpm-nginx

USER root

# Copy your application code
COPY . /var/www/html

# Set working directory
WORKDIR /var/www/html

# Composer config
ENV COMPOSER_ALLOW_SUPERUSER 1
ENV COMPOSER_MEMORY_LIMIT -1
ENV COMPOSER_NO_INTERACTION 1

# Ensure .env exists for artisan
RUN cp .env.example .env || true

# Install PHP dependencies
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --optimize-autoloader

# Install Node + build Vite assets
RUN apt-get update && apt-get install -y nodejs npm \
    && npm ci \
    && npm run build \
    && rm -rf /var/lib/apt/lists/*

# 🆕 Create entrypoint script that runs BEFORE the container starts
RUN echo '#!/bin/bash\n\
set -e\n\
echo "=== Running migrations ==="\n\
php /var/www/html/artisan migrate --force\n\
echo "=== Caching config ==="\n\
php /var/www/html/artisan config:cache\n\
echo "=== Caching routes ==="\n\
php /var/www/html/artisan route:cache\n\
' > /etc/entrypoint.d/99-laravel-init.sh \
    && chmod +x /etc/entrypoint.d/99-laravel-init.sh

# Fix permissions
RUN mkdir -p /var/www/html/storage/framework/sessions \
    && mkdir -p /var/www/html/storage/framework/views \
    && mkdir -p /var/www/html/storage/framework/cache/data \
    && mkdir -p /var/www/html/storage/logs \
    && mkdir -p /var/www/html/bootstrap/cache \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

USER www-data