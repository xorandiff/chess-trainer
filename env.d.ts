/// <reference types="vite/client" />

type White = "w";
type Black = "b";

type Rook = "r";
type Bishop = "b";
type Knight = "n";
type King = "k";
type Queen = "q";
type Pawn = "p";

type Piece = {
    type: string;
    color: White | Black;
    square: number;
    rank: number;
    file: number;
    legalMoves: number[];
    captured: boolean;
};

type PiecePartial = Partial<Piece>;

type Pieces = string[];

type Move = {
    pieces: Pieces;
    fen: string;
    from: number;
    to: number;
    isCapture: boolean;
    isCheck: boolean;
    isCheckmate: boolean;
    castlingSide: boolean | "k" | "q";
    promotionType: "" | Piece["type"];
    algebraicNotation: string;
    sound: number;
    mark: number;
    bestNextMove?: {
        move: Move;
        eval: number;
        mate: boolean;
    };
}

type Square = [number, number];

type Arrow = {
    color: string;
    from: number;
    to: number;
    transform: string;
    points: string;
}

type SquareData = {
    active: boolean;
    legalMove: boolean;
    highlight: boolean;
    highlightColor: string;
};

type Board = SquareData[];

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
    multipv: number
}

interface StockfishConfig extends EngineConfig {
    elo: number,
    skill: number
}

type StockfishConfigPartial = Partial<StockfishConfig>;

type Variation = {
    moves: Move[];
    pieces: Pieces;
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

