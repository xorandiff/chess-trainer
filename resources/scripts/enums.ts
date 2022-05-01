export const enum SOUND_TYPE {
    MOVE_SELF = 0,
    MOVE_OPPONENT = 1,
    MOVE_CHECK = 2,
    CAPTURE = 3,
    CASTLE = 4,
    PROMOTE = 5,
    GAME_START = 6,
    GAME_END = 7,
}

export enum PIECE_TYPE {
    ROOK = "r",
    KNIGHT = "n",
    BISHOP = "b",
    KING = "k",
    QUEEN = "q",
    PAWN = "p",
}

export enum PIECE_COLOR {
    WHITE = "w",
    BLACK = "b",
}

export enum CASTLING_SIDE {
    KINGSIDE = 'k',
    QUEENSIDE = 'q',
}

export enum ENGINE {
    STOCKFISH = 'stockfish',
    LC0 = 'lc0'
}

export enum GAME_RESULT {
    IN_PROGRESS,
    WHITE_WON,
    BLACK_WON,
    DRAW
}