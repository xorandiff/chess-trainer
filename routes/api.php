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

Route::get('/bestmove/{movetime}/{level}/{fen}', function ($movetime, $level, $fen) {
    $input = new InputStream();
    $input->write("ucinewgame\n");
    $input->write("setoption name Skill Level value " . $level . "\n");
    $input->write("setoption name UCI_LimitStrength value true\n");
    $input->write("position fen " . $fen . "\n");
    $input->write("go movetime " . $movetime . "\n");
    $input->close();
    
    $process = new Process([dirname(__DIR__) . '\stockfish_14.1_win_x64_avx2.exe']);
    $process->setInput($input);

    $process->start();

    $process->waitUntil(function ($type, $output) {
        return str_contains($output, "bestmove");
    });

    $output = explode("\n", $process->getOutput());
    array_pop($output);
    $bestmove = explode(" ", array_pop($output))[1];
    $depth = explode(" ", array_pop($output))[2];
    return response()->json(['bestmove' => $bestmove, 'depth' => intval($depth)]);
})->where('fen', '.*');

Route::get('/eval/{fen}', function ($fen) {
    $input = new InputStream();
    $input->write("uci\n");
    $input->write("ucinewgame\n");
    $input->write("position fen " . $fen . "\n");
    $input->write("eval\n");
    $input->write("quit\n");
    $input->close();
    
    $process = new Process([dirname(__DIR__) . '\stockfish_14.1_win_x64_avx2.exe']);
    $process->setInput($input);

    $process->run();

    preg_match('/Final evaluation\s+(.+)\s+/', $process->getOutput(), $matches);
    return response()->json(['eval' => floatval($matches[1])]);
})->where('fen', '.*');
