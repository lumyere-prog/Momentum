<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

use App\Http\Controllers\TaskController;

Route::get('/tasks', [TaskController::class, 'index']);
Route::post('/tasks', [TaskController::class, 'store']);

Route::post('/tasks/{task}/complete', [TaskController::class, 'toggleComplete']);

// Add this line for deletion:
Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);

// Add these comment routes:
Route::get('/tasks/{task}/comments', [TaskController::class, 'comments']);
Route::post('/tasks/{task}/comments', [TaskController::class, 'storeComment']);
Route::delete('/comments/{comment}', [TaskController::class, 'destroyComment']);