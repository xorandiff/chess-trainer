<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TokenController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Auth;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users/auth', AuthController::class);
    //Route::get('/pgn/save', AuthController::class);
});

Route::post('/sanctum/token', TokenController::class);

Route::get('/logout', function (Request $request) {
    Auth::logout();
 
    $request->session()->invalidate();
    $request->session()->regenerateToken();
 
    return response()->json([], 200);
});