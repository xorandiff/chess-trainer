<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Symfony\Component\Process\Process; 
use Symfony\Component\Process\InputStream; 
use Symfony\Component\Process\Exception\ProcessFailedException;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/bestmove/{fen}', function ($fen) {
    $input = new InputStream();
    $input->write("uci\n");
    $input->write("ucinewgame\n");
    $input->write("position fen " . $fen . "\n");
    $input->write("go movetime 2000\n");
    $input->write("quit\n");
    $input->close();
    
    $process = new Process([dirname(__DIR__) . '\stockfish_14.1_win_x64_avx2.exe']);
    $process->setInput($input);

    $process->run();

    preg_match('/bestmove ([\w+\d+]+)/', $process->getOutput(), $matches);
    return response()->json(['bestmove' => $matches[1]]);
})->where('fen', '.*');;
