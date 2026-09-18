<?php

use App\Http\Controllers\PostController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

use function Laravel\Prompts\task;

Route::get('/', function () {
    return view('dashboard.index');
});


Route::view('/task', 'task.index')->name('task');

Route::get('/tasks', [TaskController::class, 'index']);
Route::post('/tasks', [TaskController::class, 'store']);
Route::post('/tasks/{task}/complete', [TaskController::class, 'toggleComplete']);
Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
Route::get('/tasks/{task}/comments', [TaskController::class, 'comments']);
Route::post('/tasks/{task}/comments', [TaskController::class, 'storeComment']);
Route::delete('/comments/{comment}', [TaskController::class, 'destroyComment']);