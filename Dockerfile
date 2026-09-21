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

# Fix permissions
RUN mkdir -p /var/www/html/storage/framework/sessions \
    && mkdir -p /var/www/html/storage/framework/views \
    && mkdir -p /var/www/html/storage/framework/cache/data \
    && mkdir -p /var/www/html/storage/logs \
    && mkdir -p /var/www/html/bootstrap/cache \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# 🆕 Run migrations automatically at container start
COPY --chown=www-data:www-data docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER www-data

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]