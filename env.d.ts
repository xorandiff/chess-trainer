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
    piece: Piece,
    from: Square,
    to: Square
}

type Board = {
    piece?: Piece;
    dragged: boolean,
    active: boolean,
    legalMove: boolean,
    highlight: boolean,
}[][];