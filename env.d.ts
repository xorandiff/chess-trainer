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

type Piece = {
    type: Rook | Bishop | Knight | King | Queen | Pawn;
    color: White | Black;
    square: Square;
    legalMoves: Square[];
};

type Move = {
    piece: Piece;
    from: Square;
    to: Square;
    isCapture: boolean;
    isCheck: boolean;
    isCheckmate: boolean;
    castlingSide: boolean | "k" | "q";
    promotionType: boolean | Piece["type"];
    algebraicNotation: string;
    fen: string;
    sound: string;
}

type Fullmove = {
    w: Move;
    b?: Move;
}

type Arrow = {
    color: string;
    rotation: string;
    points: string;
}

type Board = {
    piece?: Piece;
    dragged: boolean;
    active: boolean;
    legalMove: boolean;
    highlight: boolean;
    highlightColor: string;
    draggedOver: boolean;
}[][];