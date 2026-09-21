#!/bin/bash
set -e

# Ensure storage directories exist
mkdir -p /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/logs

# Run migrations
echo "=== Running migrations ==="
php /var/www/html/artisan migrate --force

# Cache config and routes
echo "=== Caching config ==="
php /var/www/html/artisan config:cache

echo "=== Caching routes ==="
php /var/www/html/artisan route:cache

# Start the original container process
echo "=== Starting PHP-FPM and Nginx ==="
exec /init