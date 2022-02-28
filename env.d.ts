/// <reference types="vite/client" />

/* import { PIECE_TYPE, PIECE_COLOR } from 'src/chessboard.ts';

type White = PIECE_COLOR.WHITE;
type Black = PIECE_COLOR.BLACK;

type Rook = PIECE_TYPE.ROOK;
type Bishop = PIECE_TYPE.BISHOP;
type Knight = PIECE_TYPE.KNIGHT;
type King = PIECE_TYPE.KING;
type Queen = PIECE_TYPE.QUEEN;
type Pawn = PIECE_TYPE.PAWN; */

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
};