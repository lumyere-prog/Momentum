<?php

// 🩺 DIAGNOSTIC: capture output at each stage
register_shutdown_function(function () {
    $err = error_get_last();
    if ($err && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        file_put_contents('php://stderr', "!!! SHUTDOWN ERROR: " . $err['message'] . " in " . $err['file'] . ":" . $err['line'] . "\n");
    }
});

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';

// 🩺 Check for output produced BEFORE handleRequest
if (headers_sent($file, $line)) {
    file_put_contents('php://stderr', "!!! HEADERS SENT BEFORE handleRequest: {$file}:{$line}\n");
} else {
    file_put_contents('php://stderr', "Clean before handleRequest ✅\n");
}

// 🩺 Wrap handleRequest so we can catch output
ob_start();
try {
    $response = $app->handleRequest(Request::capture());
} catch (\Throwable $e) {
    $buffered = ob_get_clean();
    file_put_contents('php://stderr', "!!! EXCEPTION: " . get_class($e) . ": " . $e->getMessage() . "\n");
    file_put_contents('php://stderr', "!!! AT: " . $e->getFile() . ":" . $e->getLine() . "\n");
    if (!empty($buffered)) {
        file_put_contents('php://stderr', "!!! BUFFERED OUTPUT BEFORE EXCEPTION: [" . substr($buffered, 0, 500) . "]\n");
    }
    throw $e;
}
$buffered = ob_get_clean();
if (!empty($buffered)) {
    file_put_contents('php://stderr', "!!! OUTPUT DURING handleRequest: [" . substr($buffered, 0, 500) . "]\n");
} else {
    file_put_contents('php://stderr', "No output during handleRequest ✅\n");
}