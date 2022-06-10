<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Http\Resources\PuzzleResource;

class PuzzlesController extends Controller
{
    /**
     * Display random puzzle in given rating range
     *
     * @return \Illuminate\Http\Response
     */
    public function randomInRange(int $from, int $to)
    {
        $puzzle = DB::table('puzzles')
                        ->where('rating', '>=', $from)
                        ->where('rating', '<=', $to)
                        ->inRandomOrder()
                        ->first();
        return new PuzzleResource($puzzle);
    }

    /**
     * Store a newly created puzzle.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        DB::table('puzzles')->insert([
            'rating' => $request->rating,
            'pgn' => $request->pgn
        ]);

        return response()->json('');
    }
}
