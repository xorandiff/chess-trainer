import _ from 'lodash';
import PieceVue from './components/Piece.vue';

export const enum PIECE_TYPE {
    ROOK = "r",
    KNIGHT = "n",
    BISHOP = "b",
    KING = "k",
    QUEEN = "q",
    PAWN = "p",
}

export const enum PIECE_COLOR {
    WHITE = "w",
    BLACK = "b",
}

export const enum CASTLING_SIDE {
    KINGSIDE = 'k',
    QUEENSIDE = 'q',
}

export class Chessboard {
    public static create(fen: string, isPlayingWhite: boolean) {
        //Validate if FEN is correct
        const regex = /\s*^(((?:[rnbqkpRNBQKP1-8]+\/){7})[rnbqkpRNBQKP1-8]+)\s([b|w])\s([K|Q|k|q]{1,4})\s(-|[a-h][1-8])\s(\d+\s\d+)$/;
        if (!fen.match(regex)) {
            return {
                board: [],
                activeColor: PIECE_COLOR.WHITE,
            }
        }

        let board: any[][] = new Array(8).fill(0).map(_row => new Array(8));
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                board[i][j] = {
                    piece: null,
                    dragged: false,
                    active: false,
                    legalMove: false,
                };
            }
        }

        let fields = fen.split(' ');
        let activeColor = fields[1] == PIECE_COLOR.WHITE ? PIECE_COLOR.WHITE : PIECE_COLOR.BLACK;
        let castlingAvailability = fields[2];
        let enPassantTargetSquare = fields[3];
        let halfmoveClock = fields[4];
        let fullmoveNumber = fields[5];

        let rows = fields[0].split('/');
        
        for (let i = 0; i < 8; i++) {
            let row = rows[i];
            for (let j = 0; j < 8; j++) {
                let c = row[0];
                row = row.substring(1);
                if (["k", "q", "b", "n", "p", "r"].includes(c.toLowerCase())) {
                    board[i][j].piece = { type: c.toLowerCase(), color: c === c.toLowerCase() ? 'b' : 'w', square: [i, j] };
                } else {
                    j += parseInt(c) - 1;
                }
            }
        }
        
        return {
            board,
            activeColor
        };
    }

    public static getPieces(board: any[][], color: PIECE_COLOR) {
        let pieces: Piece[] = [];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (board[i][j].piece && board[i][j].piece.color === color) {
                    pieces.push(board[i][j].piece);
                }
            }
        }
        return pieces;
    }

    public static algebraicToBoard(algebraicSquare: string) : Square {
        const file = algebraicSquare.charCodeAt(0) - 'a'.charCodeAt(0);
        const rank = 7 - (parseInt(algebraicSquare[1]) - 1);

        return [rank, file];
    }

    /**
     * Method for converting board to FEN string
     */
    public static getFen(board: any[][], castlingRights: any, halfmoves: number, fullmoves: number, turnColor: PIECE_COLOR, lastMove: any) {
        let ranks = [];
        for (let i = 0; i < 8; i++) {
            let rank = '';
            let emptySquares = 0;
            for (let j = 0; j < 8; j++) {
                if (board[i][j].piece) {
                    if (emptySquares > 0) {
                        rank += emptySquares;
                    }
                    const { type, color } = board[i][j].piece;
                    rank += color === PIECE_COLOR.BLACK ? type : type.toUpperCase();
                    emptySquares = 0;
                } else {
                    emptySquares++;
                }
            }
            if (emptySquares > 0) {
                rank += emptySquares;
            }
            ranks.push(rank);
        }
        const position = ranks.join('/');

        let castling = '';
        if (castlingRights[PIECE_COLOR.WHITE].includes(CASTLING_SIDE.KINGSIDE)) {
            castling += CASTLING_SIDE.KINGSIDE.toUpperCase();
        }
        if (castlingRights[PIECE_COLOR.WHITE].includes(CASTLING_SIDE.QUEENSIDE)) {
            castling += CASTLING_SIDE.QUEENSIDE.toUpperCase();
        }
        if (castlingRights[PIECE_COLOR.BLACK].includes(CASTLING_SIDE.KINGSIDE)) {
            castling += CASTLING_SIDE.KINGSIDE;
        }
        if (castlingRights[PIECE_COLOR.BLACK].includes(CASTLING_SIDE.QUEENSIDE)) {
            castling += CASTLING_SIDE.QUEENSIDE;
        }
        if (!castling) {
            castling = '-';
        }

        let enPassantTargetSquare = '-';
        if (lastMove.piece.type === PIECE_TYPE.PAWN && Math.abs(lastMove.from[0] - lastMove.to[0]) === 2) {
            const d = lastMove.piece.color === PIECE_COLOR.WHITE ? 1 : -1;
            const algebraicRank = (7 - lastMove.to[0]) + 1 + d;
            const algebraicFile = String.fromCharCode('a'.charCodeAt(0) + lastMove.to[1]);
            enPassantTargetSquare = `${algebraicFile}${algebraicRank}`;
        }

        const fen = [position, turnColor, castling, enPassantTargetSquare, halfmoves, fullmoves].join(' ');

        return fen;
    }

    /**
     * Method for updating castling rights for given color 
     */
    public static updateCastlingRights(board: any[][], color: PIECE_COLOR, currentRights: any[]) {
        //Determine castling rank
        const r = color === PIECE_COLOR.WHITE ? 7 : 0;

        if (!board[r][4].piece) {
            //King has moved, no castling rights
            return [];
        }

        if (!board[r][7].piece) {
            //Kingside rook has moved, no kingside castling rights
            _.pull(currentRights, CASTLING_SIDE.KINGSIDE);
        }

        if (!board[r][0].piece) {
            //Queenside rook has moved, no queenside castling rights
            _.pull(currentRights, CASTLING_SIDE.QUEENSIDE);
        }

        return currentRights;
    }

    /**
     * Method for checking whether given color can perform castling 
     * on given side
     */
    public static canCastle(board: any[][], color: PIECE_COLOR, side: CASTLING_SIDE) {
        //Determine castling rank
        const r = color === PIECE_COLOR.WHITE ? 7 : 0;

        /**
         * Squares that must be empty for given castling side in order 
         * to perform castling
         */
        let checks = [[r, 5], [r, 6]];
        if (side === CASTLING_SIDE.QUEENSIDE) {
            checks = [[r, 1], [r, 2], [r, 3]];
        }

        for (const [i, j] of checks) {
            if (board[i][j].piece) {
                //Square is not empty, can't castle
                return false;
            }
        }

        return true;
    }

    /**
     * Method for computing legal moves and captures of a piece
     */
    public static computeLegalMoves(board: any[][], [i, j]: Square, castlingRights: any, lastMove: any) {
        let legalMoves: Square[] = [];
        const piece = board[i][j].piece;
        if (!piece) {
            return legalMoves;
        }
        const oppositeColor = piece.color === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;
        const pseudoLegalMoves = this.computePseudoLegalMoves(board, [i, j], castlingRights, lastMove);

        for (const [a, b] of pseudoLegalMoves) {
            let x = JSON.parse(JSON.stringify(board));
            x = this.makeMove(x, [i, j], [a, b]);

            let kingSquare: Square = [0, 0];
            for (let r = 0; r < 8; r++) {
                for (let f = 0; f < 8; f++) {
                    if (x[r][f].piece && x[r][f].piece.type === PIECE_TYPE.KING) {
                        if (x[r][f].piece.color === piece.color) {
                            kingSquare = [r, f];
                            break;
                        }
                    }
                }
            }

            if (!this.isSquareAttacked(x, oppositeColor, kingSquare)) {
                legalMoves.push([a, b]);
            }
        }

        return legalMoves;
    }

    /**
     * Method for performing a move
     */
    private static makeMove(board: any[][], [r1, f1]: Square, [r2, f2]: Square) {
        if (board[r1][f1].piece) {
            board[r2][f2].piece = board[r1][f1].piece;
            board[r1][f1].piece = null;
        }
        return board;
    }

    /**
     * Method for computing pseudo-legal moves and captures of a piece
     */
    private static computePseudoLegalMoves(board: any[][], [i, j]: Square, castlingRights: any, lastMove: any) : Square[] {
        const piece = board[i][j].piece;
        const isWhite = piece.color === PIECE_COLOR.WHITE
        const oppositeColor = piece.color === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;

        let pseudoLegalMoves: Square[] = [];

        /**
         * Computing pseudo-legal moves and captures for pawns is done separately, 
         * because they distinct much from other pieces moves and captures
         */
        if (piece.type == PIECE_TYPE.PAWN) {
            let d = -1; //for white color
            if (!isWhite) {
                d = 1; //for black color
            }
            if ((isWhite && i > 0) || (!isWhite && i < 7)) {
                //Pseudo-legal moves for pawn
                if (!board[i + d][j].piece) {
                    pseudoLegalMoves.push([i + d, j]);
                    if (((isWhite && i === 6) || (!isWhite && i === 1)) && !board[i + 2 * d][j].piece) {
                        pseudoLegalMoves.push([i + 2 * d, j]);
                    }
                }

                //Pseudo-legal captures for pawn
                if (j > 0 && board[i + d][j - 1].piece && board[i + d][j - 1].piece.color === oppositeColor) {
                    pseudoLegalMoves.push([i + d, j - 1]);
                }
                if (j < 7 && board[i + d][j + 1].piece && board[i + d][j + 1].piece.color === oppositeColor) {
                    pseudoLegalMoves.push([i + d, j + 1]);
                }

                //Check if en passant is a pseudo-legal capture
                const fromRank = isWhite ? 1 : 6;
                const toRank = isWhite ? 3 : 4;
                if (i === toRank && lastMove.piece.type === PIECE_TYPE.PAWN && lastMove.piece.color === oppositeColor) {
                    const [fx, fy] = lastMove.from;
                    const [tx, ty] = lastMove.to;
                    if (fx === fromRank && tx === toRank && (ty === j + 1 || ty === j - 1)) {
                        pseudoLegalMoves.push([i + d, ty]);
                    }
                }
            }
        } else {
            /**
             * Boolean flags to mark reached directions ends, for bishop, 
             * rook and knight we distinguish 4 directions and for queen
             * and king we distinguish 8 directions
             */
            let reachedEnd = new Array(4).fill(false);
            if ([PIECE_TYPE.QUEEN, PIECE_TYPE.KING].includes(piece.type)) {
                reachedEnd = new Array(8).fill(false);
            }
            
            /**
             * Here we define maximum checking length for each direction, 
             * in case of bishop, rook and queen maximum length can be up
             * to 7 for each direction and for knight and king direction
             * length is always 1
             */
            let range = Math.max(Math.max(i, 7 - i), Math.max(j, 7 - j));
            if ([PIECE_TYPE.KING, PIECE_TYPE.KNIGHT].includes(piece.type)) {
                range = 1;
            }

            //Iteration variable s always satisfies 1 <= s <= 6
            for (let s = 1; s <= range; s++) {
                //If all ends of all directions are reached, break the loop
                if (!reachedEnd.includes(false)) {
                    break;
                }

                //For each s we perform a check in some direction
                let checks: any = [];
                checks[PIECE_TYPE.BISHOP] = [[i - s, j - s], [i - s, j + s], [i + s, j - s], [i + s, j + s]];
                checks[PIECE_TYPE.ROOK] = [[i, j - s], [i, j + s], [i - s, j], [i + s, j]];
                checks[PIECE_TYPE.KNIGHT] = [[i-2, j-1], [i-2, j+1], [i+2, j-1], [i+2, j+1], [i-1, j-2], [i-1, j+2], [i+1, j-2], [i+1, j+2]];
                checks[PIECE_TYPE.QUEEN] = checks[PIECE_TYPE.KING] = [...checks[PIECE_TYPE.BISHOP], ...checks[PIECE_TYPE.ROOK]];

                /**
                * Check whether castling queenside/kingside is a pseudo-legal move for king
                * 
                * If current color has castling rights, then there must be king 
                * either on square [0, 4] or on square [7, 4]
                */
                if (castlingRights[piece.color] && (i === 7 || i === 0) && j === 4) {
                    const sides = [CASTLING_SIDE.KINGSIDE, CASTLING_SIDE.QUEENSIDE];

                    for (const side of sides) {
                        //Check if color has castling rights on current side
                        if (castlingRights[piece.color].includes(side)) {
                            //Check if castling is possible
                            if (this.canCastle(board, piece.color, side)) {
                                const d = side === CASTLING_SIDE.KINGSIDE ? 2 : -2;
                                //Add additional king pseudo-legal move for kingside castling
                                checks[PIECE_TYPE.KING].push([i, j + d]);
                            }
                        }
                    }
                }

                checks[piece.type].forEach(([a, b]: [number, number], n: number) => {
                    //First we check if we are still in our board
                    if (!reachedEnd[n] && 0 <= a && a <= 7 && 0 <= b && b <= 7) {
                        if (board[a][b].piece) {
                            /**
                             * Piece is in a way on current direction, we mark
                             * search in this direction as completed
                             */
                            reachedEnd[n] = true;

                            if (board[a][b].piece.color === oppositeColor) {
                                //Piece is of opposite color, so we mark it as pseudo-legal capture
                                pseudoLegalMoves.push([a, b]);
                            }
                        } else {
                            //Square is empty, so we mark it as pseudo-legal move
                            pseudoLegalMoves.push([a, b]);
                        }
                    }
                });
            }
        }

        return pseudoLegalMoves;
    }

    /**
     * Method for finding square marked as active
     */
    public static getActiveSquare(board: any[][]) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (board[i][j].active) {
                    return [i, j];
                }
            }
        }
        return null;
    }

    /**
     * Method for detecting any attack by given color on given square
     */
    private static isSquareAttacked(board: any[][], color: PIECE_COLOR, [i, j]: Square) : boolean {
        for (let k = 0; k < 2; k++) {
            const shortRangeChecks: any = [
                [[i - 1, j - 1], [i - 1, j + 1]], //pawn
                [[i-2, j-1], [i-2, j+1], [i+2, j-1], [i+2, j+1], [i-1, j-2], [i-1, j+2], [i+1, j-2], [i+1, j+2]], //knight
            ];
            for (let n = 0; n < shortRangeChecks[k].length; n++) {
                const [a, b] = shortRangeChecks[k][n];
                if (0 <= a && a <= 7 && 0 <= b && b <= 7) {
                    if (board[a][b].piece && board[a][b].piece.color === color) {
                        if (k === 0 && board[a][b].piece.type === PIECE_TYPE.PAWN) {
                            return true;
                        }
                        if (k === 1 && board[a][b].piece.type === PIECE_TYPE.KNIGHT) {
                            return true;
                        }
                    }
                }
            }
        }

        for (let k = 0; k < 2; k++) {
            let reachedEnd = new Array(4).fill(false);
            let range = Math.max(Math.max(i, 7 - i), Math.max(j, 7 - j));

            for (let s = 1; s <= range; s++) {
                if (!reachedEnd.includes(false)) {
                    break;
                }
                let longRangeChecks: any = [
                    [[i - s, j - s], [i - s, j + s], [i + s, j - s], [i + s, j + s]], //bishop or queen
                    [[i, j - s], [i, j + s], [i - s, j], [i + s, j]], //rook or queen
                ];
            
                for (let n = 0; n < 4; n++) {
                    const [a, b] = longRangeChecks[k][n];
                    if (!reachedEnd[n] && 0 <= a && a <= 7 && 0 <= b && b <= 7) {
                        if (board[a][b].piece) {
                            if (board[a][b].piece.color === color) {
                                if (k === 0 && [PIECE_TYPE.BISHOP, PIECE_TYPE.QUEEN].includes(board[a][b].piece.type)) {
                                    return true;
                                }
                                if (k === 1 && [PIECE_TYPE.ROOK, PIECE_TYPE.QUEEN].includes(board[a][b].piece.type)) {
                                    return true;
                                }
                            }
                            reachedEnd[n] = true;
                        }
                    }
                }
            }
        }

        return false;
    }
}
