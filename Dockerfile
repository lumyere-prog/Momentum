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

# Allow composer to run as root
ENV COMPOSER_ALLOW_SUPERUSER 1

# Install PHP dependencies
RUN composer install --no-dev --no-interaction --no-progress --optimize-autoloader --working-dir=/var/www/html

# Tell the start.sh to skip composer because we already handled it
ENV SKIP_COMPOSER 1

CMD ["/start.sh"]