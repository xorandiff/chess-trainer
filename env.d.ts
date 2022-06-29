/// <reference types="vite/client" />

type White = "w";
type Black = "b";

type Rook = "r";
type Bishop = "b";
type Knight = "n";
type King = "k";
type Queen = "q";
type Pawn = "p";

type Square = [number, number];

type Coordinates = number | Square | string;

type Piece = {
    type: string;
    color: White | Black;
    square: number;
    rank: number;
    file: number;
    legalMoves: number[];
    captured: boolean;
};

type Pieces = string[];

type Move = {
    pieces: Pieces;
    fen: string;
    from: number;
    to: number;
    color: White | Black;
    type: "" | Rook | Bishop | Knight | King | Queen | Pawn;
    legalMoves: number[][];
    isCapture: boolean;
    isCheck: boolean;
    isCheckmate: boolean;
    castlingSide: "" | "k" | "q";
    castlingRights: string;
    promotionType: string;
    algebraicNotation: string;
    algebraicMoves: string;
    fullmoves: number;
    halfmoves: number;
    mark: number;
    bestNextMove?: {
        move: Move;
        eval: number;
        mate: boolean;
    };
}

type Arrow = {
    color: string;
    from: number;
    to: number;
    transform: string;
    points: string;
}

type EngineResponseVariation = {
    pv: string;
    mate: boolean;
    score: number;
}

type EngineResponse = {
    bestmove: string;
    depth: number;
    mate: number;
    eval: number;
    variations: EngineResponseVariation[];
}

interface EngineConfig {
    depth: number,
    multipv: number,
    movetime: number,
    evaluation: boolean
}

interface StockfishConfig extends EngineConfig {
    elo: number,
    skill: number,
    analyseMode: boolean
}

type Variation = {
    moves: Move[];
    eval: number;
    mate: boolean;
}

type ApiResponse = {
    data: object;
    error?: string;
}

type OpeningData = {
    name: string;
    eco: string;
    fen: string;
    movesAlgebraic: string;
}

type PgnTags = {
    event: string;
    site: string;
    date: string;
    round: string;
    white: string;
    black: string;
    result: string;
    fen?: string;
    firstMove?: string;
    solution?: string;
}

