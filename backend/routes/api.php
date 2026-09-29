<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ConfessionController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\QuestionBankController;
use App\Http\Controllers\Api\InternshipController;
use App\Http\Controllers\Api\FriendshipController;
use App\Http\Controllers\Api\QrCodeController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\UserController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->get('/me', [AuthController::class, 'me']);
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('confessions', ConfessionController::class);
    Route::apiResource('materials', MaterialController::class);
    Route::apiResource('question-banks', QuestionBankController::class);
    Route::apiResource('internships', InternshipController::class);
    Route::get('/friends', [FriendshipController::class, 'index']);
    Route::post('/friends', [FriendshipController::class, 'store']);
    Route::put('/friends/{friendship}/accept', [FriendshipController::class, 'accept']);
    Route::delete('/friends/{friendship}', [FriendshipController::class, 'destroy']);
    Route::get('/qr-code', [QrCodeController::class, 'generate']);
    Route::get('/qr-code/profile/{userId}', [QrCodeController::class, 'profile']);
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);
    Route::get('/users/search', [UserController::class, 'search']);
    
});