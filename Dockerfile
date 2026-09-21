FROM richarvey/nginx-php-fpm:latest

# Copy your application code
COPY . .

# Image config
ENV WEBROOT /var/www/html/public
ENV PHP_ERRORS_STDERR 1
ENV RUN_SCRIPTS 1
ENV REAL_IP_HEADER 1

# Laravel config
ENV APP_ENV production
ENV APP_DEBUG false
ENV LOG_CHANNEL stderr

# Composer config
ENV COMPOSER_ALLOW_SUPERUSER 1
ENV COMPOSER_MEMORY_LIMIT -1
ENV COMPOSER_NO_INTERACTION 1

# Ensure .env exists for artisan during composer scripts
RUN cp .env.example .env || true

# Install PHP dependencies (allow unlimited memory)
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --optimize-autoloader \
    --working-dir=/var/www/html

# Tell start.sh we already ran composer
ENV SKIP_COMPOSER 1

CMD ["/start.sh"]