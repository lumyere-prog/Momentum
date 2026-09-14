<?php

use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::view('/comment', 'comment')->name('comment');

Route::get('/tasks', [TaskController::class, 'index']);
Route::post('/tasks', [TaskController::class, 'store']);
Route::post('/tasks/{task}/complete', [TaskController::class, 'toggleComplete']);
Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
Route::get('/tasks/{task}/comments', [TaskController::class, 'comments']);
Route::post('/tasks/{task}/comments', [TaskController::class, 'storeComment']);
Route::delete('/comments/{comment}', [TaskController::class, 'destroyComment']);