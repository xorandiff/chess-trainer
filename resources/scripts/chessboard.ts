import { PIECE_TYPE, PIECE_COLOR, CASTLING_SIDE } from '@/enums';
import _ from 'lodash';
import moment from 'moment';

export default class Chessboard {
    public static create(fen: string) {
        let board: Board = new Array(8).fill(0).map(_row => new Array(8));
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                board[i][j] = {
                    active: false,
                    legalMove: false,
                    highlight: false,
                    highlightColor: ''
                };
            }
        }

        let fields = fen.split(' ');
        const color = fields[1] == PIECE_COLOR.WHITE ? PIECE_COLOR.WHITE : PIECE_COLOR.BLACK;
        const castlingRightsString = fields[2];
        //TODO load en passant target square
        let enPassantTargetSquare = fields[3];
        const halfmoves = parseInt(fields[4]);
        const fullmoves = parseInt(fields[5]);

        let castlingRights = {
            [PIECE_COLOR.WHITE]: [] as CASTLING_SIDE[],
            [PIECE_COLOR.BLACK]: [] as CASTLING_SIDE[],
        };
        for (let i = 0; i < castlingRightsString.length; i++) {
            let l = castlingRightsString[i].toLowerCase();
            if (l === CASTLING_SIDE.KINGSIDE) {
                if (l === castlingRightsString[i]) {
                    castlingRights[PIECE_COLOR.BLACK].push(CASTLING_SIDE.KINGSIDE);
                } else {
                    castlingRights[PIECE_COLOR.WHITE].push(CASTLING_SIDE.KINGSIDE);
                }
            }
            if (l === CASTLING_SIDE.QUEENSIDE) {
                if (l === castlingRightsString[i]) {
                    castlingRights[PIECE_COLOR.BLACK].push(CASTLING_SIDE.QUEENSIDE);
                } else {
                    castlingRights[PIECE_COLOR.WHITE].push(CASTLING_SIDE.QUEENSIDE);
                }
            }
        }

        let rows = fields[0].split('/');
        
        for (let i = 0; i < 8; i++) {
            let row = rows[i];
            for (let j = 0; j < 8; j++) {
                let c = row[0];
                row = row.substring(1);
                if (["k", "q", "b", "n", "p", "r"].includes(c.toLowerCase())) {
                    board[i][j].piece = {
                        type: c.toLowerCase() as PIECE_TYPE,
                        color: c === c.toLowerCase() ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE,
                        square: [i, j],
                        legalMoves: []
                    };
                } else {
                    j += parseInt(c) - 1;
                }
            }
        }
        
        return {
            board,
            color,
            castlingRights,
            halfmoves,
            fullmoves
        };
    }

    public static fenToBoard(fen: string) : Board {
        const rows = fen.split(' ')[0].split('/');
        let board: Board = new Array(8).fill(0).map(_row => new Array(8));
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                board[i][j] = {
                    active: false,
                    legalMove: false,
                    highlight: false,
                    highlightColor: ''
                };
            }
        }
        for (let i = 0; i < 8; i++) {
            let row = rows[i];
            for (let j = 0; j < 8; j++) {
                let c = row[0];
                row = row.substring(1);
                if (["k", "q", "b", "n", "p", "r"].includes(c.toLowerCase())) {
                    board[i][j].piece = {
                        type: c.toLowerCase() as PIECE_TYPE,
                        color: c === c.toLowerCase() ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE,
                        square: [i, j],
                        legalMoves: []
                    };
                } else {
                    j += parseInt(c) - 1;
                }
            }
        }
        
        return board;
    }

    /**
     * Method for computing position of an arrow
     */
    public static getArrowCoordinates([a, b]: Square, [c, d]: Square) {
        const x = Math.sqrt((a-c)**2 + (d-b)**2) - 1;

        const sideY = c-a;
        const sideX = b-d;
        
        let angle = Math.atan(sideX / sideY) * 180 / Math.PI;
        
        if ((sideX >= 0 && sideY < 0) || (sideX < 0 && sideY < 0)) {
            angle = 180 + angle;
        } else if (sideX < 0 && sideY >= 0) {
            angle = 360 + angle;
        }

        let transform = ``;
        let scale = ``;
        let translate = ``;
        let points = ``;

        if ((Math.abs(sideX) === 2 && Math.abs(sideY) === 1) || (Math.abs(sideX) === 1 && Math.abs(sideY) === 2)) {
            //Arrow for knight

            if (sideX === -1 && sideY === 2) {
                angle = 0;
            } else if (sideX === -2 && sideY === -1) {
                angle = 270;
            } else if (sideX === 1 && sideY === -2) {
                angle = 180;
            } else if (sideX === 2 && sideY === 1) {
                angle = 90;
            } else {
                scale = `scale(-1, 1)`;
                translate = `translate(-${b*2*12.5 + 12.5}, 0)`;
                if (sideX === 1 && sideY === 2) {
                    angle = 0;
                } else if (sideX === 2 && sideY === -1) {
                    angle = 90;
                } else if (sideX === -1 && sideY === -2) {
                    angle = 180;
                } else if (sideX === -2 && sideY === 1) {
                    angle = 270;
                }
            }

            points += `${b*12.5 + 4.875} ${a*12.5 + 10.75}, `;
            points += `${b*12.5 + 4.875} ${a*12.5 + 32.625}, `;
            points += `${b*12.5 + 14.25} ${a*12.5 + 32.625}, `;
            points += `${b*12.5 + 14.25} ${a*12.5 + 34.5}, `;
            points += `${b*12.5 + 18.75} ${a*12.5 + 31.25}, `;
            points += `${b*12.5 + 14.25} ${a*12.5 + 28}, `;
            points += `${b*12.5 + 14.25} ${a*12.5 + 29.875}, `;
            points += `${b*12.5 + 7.625} ${a*12.5 + 29.875}, `;
            points += `${b*12.5 + 7.625} ${a*12.5 + 10.75}`;
        } else {
            points += `${b*12.5 + 4.875} ${a*12.5 + 10.75}, `;
            points += `${b*12.5 + 4.875} ${a*12.5 + x*12.5 + 14.25}, `;
            points += `${b*12.5 + 3} ${a*12.5 + x*12.5 + 14.25}, `;
            points += `${b*12.5 + 6.25} ${a*12.5 + x*12.5 + 18.75}, `;
            points += `${b*12.5 + 9.5} ${a*12.5 + x*12.5 + 14.25}, `;
            points += `${b*12.5 + 7.625} ${a*12.5 + x*12.5 + 14.25}, `;
            points += `${b*12.5 + 7.625} ${a*12.5 + 10.75}`;
        }

        const center = `${b*12.5 + 6.25} ${a*12.5 + 6.25}`;
        const rotation = `${angle} ${center}`;

        transform = `rotate(${rotation})`;
        if (scale) {
            transform += ` ${scale}`;
        }
        if (translate) {
            transform += ` ${translate}`;
        }

        return {
            transform,
            points
        };
    }

    /**
     * Method for getting the pieces of given color
     */
    public static getPieces(board: Board, color: PIECE_COLOR) {
        let pieces: Piece[] = [];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (board[i][j].piece && board[i][j].piece!.color === color) {
                    pieces.push(board[i][j].piece!);
                }
            }
        }
        return pieces;
    }

    /**
     * Method for converting board notation to algebraic notation
     */
    public static boardToAlgebraic([i, j]: Square) : string {
        const algebraicRank = (7 - i) + 1;
        const algebraicFile = String.fromCharCode('a'.charCodeAt(0) + j);

        return `${algebraicFile}${algebraicRank}`;
    }

    /**
     * Method for converting move to algebraic notation
     */
    public static moveToAlgebraic(move: Move, pieces: Piece[], excludePieceType?: boolean) : string {
        const { type } = move.piece;

        let pieceString = excludePieceType ? '' : type.toUpperCase();
        if (!move.isCapture && (type === PIECE_TYPE.PAWN || move.promotionType)) {
            pieceString = '';
        }
        if (move.isCapture && (type === PIECE_TYPE.PAWN || move.promotionType)) {
            pieceString = this.boardToAlgebraic(move.from)[0];
        }

        let onSquare = '';
        if (type !== PIECE_TYPE.PAWN) {
            let piecesOfType = pieces.filter(p => p.type === type);

            //We now check if there are at least two pieces of the same type
            if (piecesOfType.length > 1) {
                //We exclude our current piece from this list
                piecesOfType = piecesOfType.filter(p => p.square[0] != move.piece.square[0] || p.square[1] != move.piece.square[1]);

                //We left only pieces which can go to the same square
                piecesOfType = piecesOfType.filter(piece => piece.legalMoves.find(square => square[0] === move.to[0] && square[1] === move.to[1]));

                if (piecesOfType.length > 0) {
                    let removedPieces = _.remove(piecesOfType, piece => piece.square[1] === move.from[1]);
                    if (!removedPieces.length) {
                        /**
                         * There are no other pieces on the same file, so file is enough 
                         * to disambiguate move
                         */
                        onSquare = this.boardToAlgebraic(move.from)[0];
                    } else {
                        let removedPieces = _.remove(piecesOfType, piece => piece.square[0] === move.from[0]);
                        if (!removedPieces.length) {
                            /**
                             * There are no other pieces on the same rank, so rank is enough 
                             * to disambiguate move
                             */
                            onSquare = this.boardToAlgebraic(move.from)[1];
                        } else {
                            onSquare = this.boardToAlgebraic(move.from);
                        }
                    }
                }
            }
        }

        let captureString = move.isCapture ? 'x' : '';

        let moveString = `${pieceString}${onSquare}${captureString}${this.boardToAlgebraic(move.to)}`;

        if (move.promotionType && typeof move.promotionType === "string") {
            moveString += `=${move.promotionType.toUpperCase()}`;
        }

        if (move.castlingSide) {
            moveString = move.castlingSide === CASTLING_SIDE.KINGSIDE ? 'O-O' : 'O-O-O';
        }

        if (move.isCheckmate) {
            moveString += '#';
        } else if (move.isCheck) {
            moveString += '+';
        }

        return moveString;
    }

    /**
     * Method for converting algebraic notation to board
     */
    public static algebraicToBoard(algebraicSquare: string) : Square {
        const file = algebraicSquare.charCodeAt(0) - 'a'.charCodeAt(0);
        const rank = 7 - (parseInt(algebraicSquare[1]) - 1);

        return [rank, file];
    }

    /**
     * Method for converting board to FEN string
     */
    public static getFen(board: Board, castlingRights: any, halfmoves: number, fullmoves: number, turnColor: PIECE_COLOR, lastMove: Move) {
        let ranks = [];
        for (let i = 0; i < 8; i++) {
            let rank = '';
            let emptySquares = 0;
            for (let j = 0; j < 8; j++) {
                if (board[i][j].piece) {
                    if (emptySquares > 0) {
                        rank += emptySquares;
                    }
                    const { type, color } = board[i][j].piece!;
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
            enPassantTargetSquare = Chessboard.boardToAlgebraic([lastMove.to[0] + d, lastMove.to[1]]);
        }

        const fen = [position, turnColor, castling, enPassantTargetSquare, halfmoves, fullmoves].join(' ');

        return fen;
    }

    /**
     * Method for converting move history to PGN string
     */
    public static getPGN(moves: Move[]) : string {
        let pgn = `[Site "Chess Trainer"]\n[Date "${moment().format('YYYY.MM.DD')}"]\n\n`;

        for (let i = 0; i < moves.length; i++) {
            if (moves[i].piece.color === PIECE_COLOR.WHITE) {
                pgn += `${i + 1}. ${moves[i].algebraicNotation} `;
            } else {
                pgn += `${moves[i].algebraicNotation} `;
            }
        }
        return pgn;
    }

    /**
     * Method for updating castling rights for given color 
     */
    public static updateCastlingRights(board: Board, color: PIECE_COLOR, currentRights: CASTLING_SIDE[]) {
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
    public static canCastle(board: Board, color: PIECE_COLOR, side: CASTLING_SIDE) {
        //Determine castling rank
        const r = color === PIECE_COLOR.WHITE ? 7 : 0;
        const oppositeColor = color === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;

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

        //Check if squares between are attacked
        if (side === CASTLING_SIDE.QUEENSIDE) {
            if (this.isSquareAttacked(board, oppositeColor, [r, 3])) {
                return false;
            }
        } else {
            if (this.isSquareAttacked(board, oppositeColor, [r, 5])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Method for detecting if given color is in check
     */
    public static detectCheck(board: Board, color: PIECE_COLOR) {
        const oppositeColor = color === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;
        if (this.isSquareAttacked(board, oppositeColor, this.getKingSquare(board, color))) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Method for getting the king's square of given color
     */
    private static getKingSquare(board: Board, color: PIECE_COLOR) {
        let kingSquare: Square = [0, 0];
        for (let r = 0; r < 8; r++) {
            for (let f = 0; f < 8; f++) {
                if (board[r][f].piece && board[r][f].piece!.type === PIECE_TYPE.KING) {
                    if (board[r][f].piece!.color === color) {
                        kingSquare = [r, f];
                        break;
                    }
                }
            }
        }
        return kingSquare;
    }

    /**
     * Method for computing legal moves and captures of a piece
     */
    public static computeLegalMoves(board: Board, [i, j]: Square, castlingRights: CASTLING_SIDE[], lastMove: Move) {
        let legalMoves: Square[] = [];
        if (!board[i][j].piece) {
            return legalMoves;
        }
        const piece = board[i][j].piece!;
        const oppositeColor = piece.color === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;
        const pseudoLegalMoves = this.computePseudoLegalMoves(board, [i, j], castlingRights, lastMove);

        /**
         * We perform each pseudo-legal move and check whether this move causes an attack on the
         * king, if so, it is illegal, otherwise, we mark it as a legal move
         */
        for (const [a, b] of pseudoLegalMoves) {
            let x = JSON.parse(JSON.stringify(board));

            x = this.makeMove(x, [i, j], [a, b]);

            if (!this.isSquareAttacked(x, oppositeColor, Chessboard.getKingSquare(x, piece.color as PIECE_COLOR))) {
                legalMoves.push([a, b]);
            }
        }

        return legalMoves;
    }

    /**
     * Method for performing a move for Board
     */
    private static makeMove(board: Board, [r1, f1]: Square, [r2, f2]: Square) {
        if (board[r1][f1].piece) {
            board[r2][f2].piece = board[r1][f1].piece;
            board[r1][f1].piece = undefined;
        }
        return board;
    }

    /**
     * Method for finding a piece occupying given square
     */
    private static findPiece(pieces: Pieces, [a, b]: Square) {
        let pieceColor = PIECE_COLOR.WHITE;
        let pieceIndex = _.findIndex(pieces[pieceColor], piece => piece.square[0] === a && piece.square[1] === b);
        if (pieceIndex < 0) {
            pieceColor = PIECE_COLOR.BLACK;
            pieceIndex = _.findIndex(pieces[pieceColor], piece => piece.square[0] === a && piece.square[1] === b);
        }

        return pieceIndex >= 0 ? { index: pieceIndex, color: pieceColor } : undefined;
    }

    /**
     * Method for finding a piece occupying given square with restriction to
     * given color
     */
    private static findColorPiece(pieces: Pieces, [a, b]: Square, color: PIECE_COLOR) : number {
        return _.findIndex(pieces[color], piece => piece.square[0] === a && piece.square[1] === b);
    }

    /**
     * Method for performing a move for Pieces
     */
     private static makeMovePieces(pieces: Pieces, [a, b]: Square, [c, d]: Square) {
        const pieceIndexColor = this.findPiece(pieces, [a, b]);
        if (pieceIndexColor) {
            const { index, color } = pieceIndexColor;
            const oppositeColor = color === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;

            _.remove(pieces[oppositeColor], piece => piece.square[0] === c && piece.square[1] === d);
            pieces[color][index].square = [c, d];
        }
    }

    /**
     * Method for computing pseudo-legal moves and captures of a piece
     */
    private static computePseudoLegalMoves(board: Board, [i, j]: Square, castlingRights: CASTLING_SIDE[], lastMove: Move) : Square[] {
        const piece = board[i][j].piece!;
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
                if (j > 0 && board[i + d][j - 1].piece && board[i + d][j - 1].piece!.color === oppositeColor) {
                    pseudoLegalMoves.push([i + d, j - 1]);
                }
                if (j < 7 && board[i + d][j + 1].piece && board[i + d][j + 1].piece!.color === oppositeColor) {
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
            if ([PIECE_TYPE.QUEEN, PIECE_TYPE.KING].includes(piece.type as PIECE_TYPE)) {
                reachedEnd = new Array(8).fill(false);
            }
            
            /**
             * Here we define maximum checking length for each direction, 
             * in case of bishop, rook and queen maximum length can be up
             * to 7 for each direction and for knight and king direction
             * length is always 1
             */
            let range = Math.max(Math.max(i, 7 - i), Math.max(j, 7 - j));
            if ([PIECE_TYPE.KING, PIECE_TYPE.KNIGHT].includes(piece.type as PIECE_TYPE)) {
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
                if (castlingRights && (i === 7 || i === 0) && j === 4) {
                    const sides = [CASTLING_SIDE.KINGSIDE, CASTLING_SIDE.QUEENSIDE];

                    for (const side of sides) {
                        //Check if color has castling rights on current side
                        if (castlingRights.includes(side)) {
                            //Check if castling is possible
                            if (this.canCastle(board, piece.color as PIECE_COLOR, side)) {
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

                            if (board[a][b].piece!.color === oppositeColor) {
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
    public static getActiveSquare(board: Board) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (board[i][j].active) {
                    return [i, j] as Square;
                }
            }
        }
        return null;
    }

    /**
     * Method for detecting any attack by given color on given square
     */
    private static isSquareAttacked(board: Board, color: PIECE_COLOR, [i, j]: Square) : boolean {
        const d = color === PIECE_COLOR.WHITE ? 1 : -1;
        for (let k = 0; k < 3; k++) {
            const shortRangeChecks: any = [
                [[i + d, j - 1], [i + d, j + 1]], //pawn
                [[i-2, j-1], [i-2, j+1], [i+2, j-1], [i+2, j+1], [i-1, j-2], [i-1, j+2], [i+1, j-2], [i+1, j+2]], //knight
                [[i-1, j-1], [i-1, j+1], [i+1, j-1], [i+1, j+1], [i, j-1], [i, j+1], [i-1, j], [i+1, j]], //king
            ];
            for (let n = 0; n < shortRangeChecks[k].length; n++) {
                const [a, b] = shortRangeChecks[k][n];
                if (0 <= a && a <= 7 && 0 <= b && b <= 7) {
                    if (board[a][b].piece && board[a][b].piece!.color === color) {
                        if (k === 0 && board[a][b].piece!.type === PIECE_TYPE.PAWN) {
                            return true;
                        }
                        if (k === 1 && board[a][b].piece!.type === PIECE_TYPE.KNIGHT) {
                            return true;
                        }
                        if (k === 2 && board[a][b].piece!.type === PIECE_TYPE.KING) {
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
                            if (board[a][b].piece!.color === color) {
                                if (k === 0 && [PIECE_TYPE.BISHOP, PIECE_TYPE.QUEEN].includes(board[a][b].piece!.type as PIECE_TYPE)) {
                                    return true;
                                }
                                if (k === 1 && [PIECE_TYPE.ROOK, PIECE_TYPE.QUEEN].includes(board[a][b].piece!.type as PIECE_TYPE)) {
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

    /**
     * Method for converting variation string returned from UCI into variation
     * display data
     */
    public static getVariationData(pieces: Pieces, variation: string) : Move[] {
        let piecesCopy: Pieces = JSON.parse(JSON.stringify(pieces));

        const algebraicMoves = variation.split(' ');
        let variationData: Move[] = [];

        for (const algebraicMove of algebraicMoves) {
            const algebraicFrom = algebraicMove.substring(0, 2);
            const algebraicTo = algebraicMove.substring(2);
            const [a, b] = this.algebraicToBoard(algebraicFrom);
            const [c, d] = this.algebraicToBoard(algebraicTo);
            
            const pieceIndexColor = this.findPiece(piecesCopy, [a, b]);

            if (pieceIndexColor !== undefined) {
                const { index, color } = pieceIndexColor;
                const oppositeColor = color === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;
                const piece = piecesCopy[color][index];

                let move: Move = {
                    piece,
                    from: [a, b],
                    to: [c, d],
                    isCapture: this.findColorPiece(piecesCopy, [c, d], oppositeColor) >= 0,
                    isCheck: false,
                    isCheckmate: false,
                    castlingSide: false,
                    promotionType: false,
                    algebraicNotation: '',
                    fen: '',
                    sound: -1
                };
    
                move.algebraicNotation = this.moveToAlgebraic(move, piecesCopy[color], true);
    
                variationData.push(move);
    
                this.makeMovePieces(piecesCopy, [a, b], [c, d]);
            } else {
                //Error
            }
        }

        return variationData.splice(0, 5);
    }
}
