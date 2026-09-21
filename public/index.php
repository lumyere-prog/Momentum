<?php

// 🩺 TEMPORARY DIAGNOSTIC
error_log("=== BOOT START ===");
error_log("Headers sent? " . (headers_sent($f, $l) ? "YES: {$f}:{$l}" : "NO"));

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

error_log("=== MAINTENANCE CHECK ===");
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

error_log("=== AUTOLOAD ===");
require __DIR__.'/../vendor/autoload.php';

error_log("=== BOOTSTRAP ===");
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

error_log("=== HANDLE REQUEST ===");
$app->handleRequest(Request::capture());

error_log("=== REQUEST HANDLED ===");