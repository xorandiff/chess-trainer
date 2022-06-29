export const enum SOUND_TYPE {
    NONE,
    MOVE_SELF,
    MOVE_OPPONENT,
    MOVE_CHECK,
    CAPTURE,
    CASTLE,
    PROMOTE,
    GAME_START,
    GAME_END,
};

export enum PIECE_TYPE {
    NONE = "",
    ROOK = "r",
    KNIGHT = "n",
    BISHOP = "b",
    KING = "k",
    QUEEN = "q",
    PAWN = "p",
};

export enum PIECE_COLOR {
    WHITE = "w",
    BLACK = "b",
};

export enum CASTLING_SIDE {
    KINGSIDE = 'k',
    QUEENSIDE = 'q',
};

export enum ENGINE {
    STOCKFISH = 'stockfish',
    LC0 = 'lc0'
};

export enum GAME_RESULT {
    IN_PROGRESS,
    WHITE_WON,
    BLACK_WON,
    DRAW
};

export enum MOVE_MARK {
    NONE,
    BRILLIANT,
    GREAT_MOVE,
    BEST_MOVE,
    EXCELLENT,
    GOOD,
    BOOK,
    INACCURACY,
    MISTAKE,
    BLUNDER,
    MISSED_WIN
};

export enum ERROR_TYPE {
    PIECE_MISSING
};

export const enum HIGHLIGHT_COLOR {
    NONE = '',
    YELLOW = 'yellow',
    ORANGE = 'orange',
    RED = 'red',
    GREEN = 'green',
    BLUE = 'blue',
    BRILLIANT_MOVE = 'brilliantMove',
    GREAT_MOVE = 'greatMove',
    BEST_MOVE = 'bestMove',
    EXCELLENT_MOVE = 'excellentMove',
    GOOD_MOVE = 'goodMove',
    INACCURACY = 'inaccuracy',
    MISTAKE = 'mistake',
    BLUNDER = 'blunder',
    BOOK_MOVE = 'bookMove'
};
