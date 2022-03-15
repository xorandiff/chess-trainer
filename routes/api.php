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

Route::get('/bestmove/{depth}/{elo}/{fen}', function ($depth, $elo, $fen) {
    $input = new InputStream();
    $input->write("ucinewgame\n");
    //$input->write("setoption name Skill Level value " . $level . "\n");
    $input->write("setoption name UCI_LimitStrength value true\n");
    $input->write("setoption name UCI_Elo value " . $elo . "\n");
    $input->write("position fen " . $fen . "\n");
    $input->write("eval\n");
    $input->write("go movetime 5000 depth " . $depth . "\n");
    $input->close();
    
    $process = new Process([dirname(__DIR__) . '\stockfish_14.1_win_x64_avx2.exe']);
    $process->setInput($input);
    $process->setTimeout(30);

    $process->start();

    $process->waitUntil(function ($type, $output) {
        //echo nl2br($output);
        return str_contains($output, "bestmove");
    });

    $rawOutput = $process->getOutput();
    //return nl2br($rawOutput);
    $output = explode("\n", $rawOutput);

    $eval = null;
    if (isset($output[70])) {
        $eval = floatval(preg_split("/[\s]+/", $output[70])[2]);
    }
    
    array_pop($output);
    $bestmove = explode(" ", array_pop($output))[1];

    $info = explode(" ", array_pop($output));
    $finalDepth = $info[2];
    $mate = 0;
    if (!strcmp($info[8], "mate")) {
        $mate = intval($info[9]);
    }
    return response()->json(['bestmove' => $bestmove, 'depth' => intval($finalDepth), 'eval' => $eval, 'mate' => $mate]);
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
