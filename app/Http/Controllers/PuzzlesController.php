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
    public function index(Request $request)
    {
        $puzzle = DB::table('puzzles')
                        ->where('rating', '>=', $request->from)
                        ->where('rating', '<=', $request->to)
                        ->inRandomOrder()
                        ->first();
        return new PuzzleResource($puzzle);
    }
}
