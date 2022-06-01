<?php

namespace App\Http\Controllers;

use App\Services\ChessParser\PgnParser;
use App\Http\Resources\GameResource;
use App\Models\User;
use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class GamesController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $user = User::find(Auth::id());

        return GameResource::collection($user->games->keyBy->id);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $user = User::find(Auth::id());

        $pgnParser = new PgnParser($request->pgn);

        if (!$pgnParser->isValid()) {
            return response()->json(['error' => 'Bad PGN format', 400]);
        }

        $pgnParser->parseTags();

        $game = $user->games()->create([
            'id' => (string) Str::uuid(),
            'pgn' => $request->pgn,
            'event' => $pgnParser->event,
            'site' => $pgnParser->site,
            'date' => $pgnParser->date,
            'round' => $pgnParser->round,
            'white' => $pgnParser->white,
            'black' => $pgnParser->black,
            'result' => $pgnParser->result
        ]);

        return new GameResource($game);
    }

    /**
     * Display the specified game.
     *
     * @param  \App\Models\Game  $game
     * @return \Illuminate\Http\Response
     */
    public function show(Game $game)
    {
        if ($game->user->id === Auth::id()) {
            return new GameResource($game);
        } else {
            return response()->json(['error' => 'Unauthorized', 401]);
        }
    }

    /**
     * Display the most recent game.
     *
     * @return \Illuminate\Http\Response
     */
    public function previous()
    {
        $user = User::find(Auth::id());

        $game = $user->games->last();
        if ($game) {
            return new GameResource($game);
        } else {
            return response()->json();
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Game  $game
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Game $game)
    {
        $game->pgn = $request->pgn;

        $pgnParser = new PgnParser($game->pgn);

        if (!$pgnParser->isValid()) {
            return response()->json(['error' => 'Bad PGN format', 400]);
        }

        $game->event = $pgnParser->event;
        $game->site = $pgnParser->site;
        $game->date = $pgnParser->date;
        $game->round = $pgnParser->round;
        $game->white = $pgnParser->white;
        $game->black = $pgnParser->black;
        $game->result = $pgnParser->result;

        $game->save();

        return new GameResource($game);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Game  $game
     * @return \Illuminate\Http\Response
     */
    public function destroy(Game $game)
    {
        $game->delete();

        return response()->json();
    }
}
