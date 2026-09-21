<?php

// Catch any output during boot
ob_start();

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';

// Check if anything was output during boot
$bootOutput = ob_get_clean();
if (!empty($bootOutput)) {
    file_put_contents('php://stderr', "!!! OUTPUT DURING BOOT: [" . $bootOutput . "]\n");
} else {
    file_put_contents('php://stderr', "Boot output clean ✅\n");
}

$app->handleRequest(Request::capture());