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