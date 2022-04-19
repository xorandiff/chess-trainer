/// <reference types="vite/client" />

type White = "w";
type Black = "b";

type Rook = "r";
type Bishop = "b";
type Knight = "n";
type King = "k";
type Queen = "q";
type Pawn = "p";

type Patch<Type> = {
    [Property in keyof Type]+?: Type[Property];
};

type Piece = {
    type: Rook | Bishop | Knight | King | Queen | Pawn;
    color: White | Black;
    square: number;
    rank: number;
    file: number;
    legalMoves: number[];
};

type PiecePatch = Patch<Piece>;

type Pieces = Piece[];

type Move = {
    piece: Piece;
    from: number;
    to: number;
    isCapture: boolean;
    isCheck: boolean;
    isCheckmate: boolean;
    castlingSide: boolean | "k" | "q";
    promotionType: boolean | Piece["type"];
    algebraicNotation: string;
    fen: string;
    sound: number;
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
    depth: number
}

interface StockfishConfig extends EngineConfig {
    elo: number,
    skill: number
}

type StockfishConfigPatch = Patch<StockfishConfig>;

type Variation = {
    moves: Move[];
    eval: number;
    mate: boolean;
}
