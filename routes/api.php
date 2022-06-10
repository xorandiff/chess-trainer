<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TokenController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GamesController;
use App\Http\Controllers\PuzzlesController;
use Illuminate\Support\Facades\Auth;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users/auth', AuthController::class);
    Route::apiResources([
        '/games' => GamesController::class,
    ]);
    Route::get('/game', [GamesController::class, 'previous']);
    Route::get('/puzzles/random/{from}/{to}', [PuzzlesController::class, 'randomInRange']);
    Route::post('/puzzles', [PuzzlesController::class, 'store']);
});

Route::post('/sanctum/token', TokenController::class);

Route::get('/logout', function (Request $request) {
    Auth::logout();
 
    $request->session()->invalidate();
    $request->session()->regenerateToken();
 
    return response()->json([], 200);
});