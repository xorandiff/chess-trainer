import { PIECE_TYPE, PIECE_COLOR, CASTLING_SIDE, SOUND_TYPE, MOVE_MARK, ERROR_TYPE } from '@/enums';
import Error from '@/errors';
import _ from 'lodash';
import moment from 'moment';
import eco from "./eco.json";

export default class Chessboard {
    public static getColor(piece: string) {
        return piece.toLowerCase() == piece ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;
    }

    public static getType(piece: string) {
        return piece.toLowerCase() as PIECE_TYPE;
    }

    public static getMoveColor(move: Move) {
        return this.getColor(move.pieces[move.to]);
    }

    public static getMoveType(move: Move) {
        return this.getType(move.pieces[move.to]);
    }
    /**
     * Converts rank and file coordinates into index coordinates
     * 
     * @param rank 
     * @param file 
     * @returns 
     */
     public static c2i(rank: number, file: number) {
        return ((rank - 1) * 8 + (file - 1));
    }

    /**
     * Converts index coordinates into rank and file coordinates
     * 
     * @param n 
     * @returns 
     */
     public static i2c(n: number) : Square {
        return [((n / 8) >> 0) + 1, (n % 8) + 1];
    }

    /**
     * Converts index coordinates into algebraic coordinates
     * 
     * @param n 
     * @returns 
     */
    public static i2a(n: number) : string {
        const [rank, file] = this.i2c(n);

        const algebraicRank = 9 - rank;
        const algebraicFile = String.fromCharCode('a'.charCodeAt(0) + file - 1);

        return `${algebraicFile}${algebraicRank}`;
    }

    /**
     * Converts coordinates coordinates into index coordinates
     * 
     * @param algebraicSquare 
     * @returns 
     */
    public static a2i(algebraicSquare: string) {
        const file = algebraicSquare.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
        const rank = 9 - parseInt(algebraicSquare[1]);

        return this.c2i(rank, file);
    }

    /**
     * Method for converting FEN string into pieces 
     * array
     * 
     * @param fen 
     * @returns 
     */
    public static fenToPiecesArray(fen: string) {
        return fen.split(' ')[0]                                    // Extract pieces portion of FEN
                  .replaceAll('/', '')                              // Remove slashes
                  .split('')                                        // Split characters into singletons
                  .map(c => {                                       // Replace numbers with whitespaces
                        if (c >= '1' && c <= '8') {
                            /**
                             * If character is number n such that
                             * 1 <= n <= 8, then replace it with n
                             * whitespaces
                             */
                            return ' '.repeat(parseInt(c));
                        }
                        // Or else don't replace it
                        return c;
                   })
                  .join('')                                         // Join singletons back into string
                  .split('')                                        // Split into singletons again
                  .map(s => s.trim());                              // Replace [' '] with ['']
    }

    /**
     * Method for creating new store state from FEN or PGN
     * 
     * @param fenOrPgn 
     * @returns 
     */
    public static create(fenOrPgn?: string) {
        let fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        let color = PIECE_COLOR.WHITE;
        let halfmoves = 0;
        let fullmoves = 1;
        let castlingRights = {
            [PIECE_COLOR.WHITE]: [CASTLING_SIDE.KINGSIDE, CASTLING_SIDE.QUEENSIDE],
            [PIECE_COLOR.BLACK]: [CASTLING_SIDE.KINGSIDE, CASTLING_SIDE.QUEENSIDE],
        };
        //TODO load en passant target square
        //let enPassantTargetSquare = fields[3];

        if (fenOrPgn && !fenOrPgn.includes('[')) {
            fen = fenOrPgn;

            const fields = fen.split(' ');
            color = fields[1] == PIECE_COLOR.WHITE ? PIECE_COLOR.WHITE : PIECE_COLOR.BLACK;
            halfmoves = parseInt(fields[4]);
            fullmoves = parseInt(fields[5]);

            if (!fields[2].includes('K')) {
                _.remove(castlingRights[PIECE_COLOR.WHITE], right => right === CASTLING_SIDE.KINGSIDE);
            }
            if (!fields[2].includes('Q')) {
                _.remove(castlingRights[PIECE_COLOR.WHITE], right => right === CASTLING_SIDE.QUEENSIDE);
            }
            if (!fields[2].includes('k')) {
                _.remove(castlingRights[PIECE_COLOR.BLACK], right => right === CASTLING_SIDE.KINGSIDE);
            }
            if (!fields[2].includes('q')) {
                _.remove(castlingRights[PIECE_COLOR.BLACK], right => right === CASTLING_SIDE.QUEENSIDE);
            }
        }

        let pieces = this.fenToPiecesArray(fen);
        let moves: Move[] = [];

        if (fenOrPgn && fenOrPgn.includes('[')) {
            //PGN
            const pgnMoves = fenOrPgn.slice(fenOrPgn.lastIndexOf(']') + 1).trim();

            const movesAlgebraic = pgnMoves.match(/[BRKQN]?[a-h]?[1-8]?x?[BRKQN]?[a-h][1-8]=?[BRKQN]?\+?#?|O-O-O|O-O/g)!;
            let currentTurnColor = color;

            for (const moveAlgebraic of movesAlgebraic) {
                if (currentTurnColor === PIECE_COLOR.BLACK) {
                    fullmoves++;
                }

                let move = this.algebraicToMove(pieces, moveAlgebraic, currentTurnColor)!;
                if (move.castlingSide) {
                    let rookFromAlgebraic = move.castlingSide === CASTLING_SIDE.KINGSIDE ? 'h1' : 'a1';
                    let rookToAlgebraic = move.castlingSide === CASTLING_SIDE.KINGSIDE ? 'f1' : 'd1';
                    if (currentTurnColor === PIECE_COLOR.BLACK) {
                        rookFromAlgebraic = move.castlingSide === CASTLING_SIDE.KINGSIDE ? 'h8' : 'a8';
                        rookToAlgebraic = move.castlingSide === CASTLING_SIDE.KINGSIDE ? 'f8' : 'd8';
                    }
                    pieces = this.makeMove(pieces, this.a2i(rookFromAlgebraic), this.a2i(rookToAlgebraic));
                }
                pieces = this.makeMove(pieces, move.from, move.to);

                castlingRights[currentTurnColor] = this.updateCastlingRights(pieces, currentTurnColor, castlingRights[currentTurnColor]);

                currentTurnColor = currentTurnColor === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;

                if (typeof move.promotionType == 'string') {
                    //TODO check if promotion type doesn't cause bug
                    //const movedPiece = this.p(pieces, move.to);
                    //pieces[pieces.indexOf(movedPiece!)].type = move.promotionType;
                }

                //move.fen = this.getFen(pieces, castlingRights, halfmoves, fullmoves, currentTurnColor, move);

                moves.push(move);
            }
        }
        
        return {
            initialFen: fen,
            pieces,
            color,
            castlingRights,
            halfmoves,
            fullmoves,
            moves
        };
    }

    /**
     * Method for computing position of an arrow
     * 
     * @param v 
     * @param w 
     * @returns 
     */
    public static getArrowCoordinates(v: number, w: number) {
        let [a, b] = this.i2c(v);
        let [c, d] = this.i2c(w);

        a--;
        b--;
        c--;
        d--;

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
     * Method for getting filtered pieces. If legal moves are used as filter, 
     * then all pieces which have given legal moves (and more than given) are
     * returned
     * 
     * @param pieces 
     * @param piecePartial 
     * @returns 
     */
    public static getFilteredIndexes(pieces: Pieces, piecePartial: PiecePartial) {
        const { type, color, square, rank, file } = piecePartial;

        let filteredIndexes = [];

        for (let i = 0; i < pieces.length; i++) {
            if (!pieces[i]) {
                continue;
            }
            if (type && this.getType(pieces[i]) !== type) {
                continue;
            }
            if (color && this.getColor(pieces[i]) !== color) {
                continue;
            }
            if (square && i !== square) {
                continue;
            }
            if (rank && (((i / 8) >> 0) + 1) !== rank) {
                continue;
            }
            if (file && ((i % 8) + 1) !== file) {
                continue;
            }
            filteredIndexes.push(i);
        }

        return filteredIndexes;
    }

    /**
     * Method for converting move to algebraic notation
     * 
     * @param move 
     * @param pieces 
     * @returns 
     */
    public static moveToAlgebraic(move: Move, legalMoves: number[][]) : string {
        const type = this.getMoveType(move);

        let pieceString = '';
        if (!move.isCapture && (type === PIECE_TYPE.PAWN || move.promotionType)) {
            pieceString = '';
        }
        if (move.isCapture && (type === PIECE_TYPE.PAWN || move.promotionType)) {
            pieceString = this.i2a(move.from)[0];
        }

        let onSquare = '';
        if (type !== PIECE_TYPE.PAWN) {
            let piecesOfType = move.pieces.map(p => move.pieces[move.from] === p ? p : '');

            //We now check if there are at least two pieces of the same type
            if (piecesOfType.filter(p => p.length > 0).length > 1) {
                //We exclude our current piece from this list
                piecesOfType[move.from] = '';

                //We left only pieces which can go to the same square
                piecesOfType = piecesOfType.map((p, i) => legalMoves[i].includes(move.to) ? p : '');

                if (piecesOfType.filter(p => p.length).length > 0) {
                    piecesOfType = piecesOfType.filter((p, i) => i % 8 === move.from % 8);
                    if (!piecesOfType.length) {
                        /**
                         * There are no other pieces on the same file, so file is enough 
                         * to disambiguate move
                         */
                        onSquare = this.i2a(move.from)[0];
                    } else {
                        piecesOfType = piecesOfType.filter((p, i) => ((i / 8) >> 0) === ((move.from / 8) >> 0));
                        if (!piecesOfType.length) {
                            /**
                             * There are no other pieces on the same rank, so rank is enough 
                             * to disambiguate move
                             */
                            onSquare = this.i2a(move.from)[1];
                        } else {
                            onSquare = this.i2a(move.from);
                        }
                    }
                }
            }
        }

        let captureString = move.isCapture ? 'x' : '';

        let moveString = `${pieceString}${onSquare}${captureString}${this.i2a(move.to)}`;

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
     * Method for converting algebraic notation to move
     * 
     * @param algebraicMove 
     * @param color 
     * @returns 
     */
    public static algebraicToMove(pieces: Pieces, algebraicMove: string, color: PIECE_COLOR) : Move | undefined {
        const groups = algebraicMove.match(/(N|K|R|B|Q)?([a-h]?[1-8]?)?(x)?([a-h][1-8])?(=[N|K|R|B|Q])?(O-O-O|O-O)?(\+|#)?/);
        if (groups) {
            let fen = '';
            let sound = SOUND_TYPE.MOVE_SELF;
            let from = -1;

            let pieceType = groups[1] !== undefined ? groups[1].toLowerCase() as PIECE_TYPE : PIECE_TYPE.PAWN;
            let fromAlgebraic = groups[2];
            let toAlgebraic = groups[4];
            const isCapture = groups[3] !== undefined;
            const promotionType = groups[5] !== undefined ? groups[5][1].toLowerCase() as PIECE_TYPE : PIECE_TYPE.NONE;

            let castlingSide: boolean | CASTLING_SIDE = false;
            if (groups[6]) {
                castlingSide = groups[6] == 'O-O' ? CASTLING_SIDE.KINGSIDE : CASTLING_SIDE.QUEENSIDE;
                pieceType = PIECE_TYPE.KING;
                sound = SOUND_TYPE.CASTLE;

                if (color === PIECE_COLOR.WHITE) {
                    toAlgebraic = castlingSide === CASTLING_SIDE.KINGSIDE ? 'g1' : 'c1';
                } else {
                    toAlgebraic = castlingSide === CASTLING_SIDE.KINGSIDE ? 'g8' : 'c8';
                }
            }
            const isCheck = groups[7] === '+';
            const isCheckmate = groups[7] === '#';

            if (isCheckmate) {
                sound = SOUND_TYPE.GAME_END;
            } else if (isCheck) {
                sound = SOUND_TYPE.MOVE_CHECK;
            } else if (isCapture) {
                sound = SOUND_TYPE.CAPTURE;
            }

            let to = 0;

            if (!toAlgebraic && fromAlgebraic) {
                toAlgebraic = fromAlgebraic;
                fromAlgebraic = '';
            }
            
            if (toAlgebraic) {
                to = this.a2i(toAlgebraic);

                if (fromAlgebraic) {
                    if (fromAlgebraic.length === 2) {
                        from = this.a2i(fromAlgebraic);
                    } else {
                        let filteredIndexes: number[] = [];
                        if (fromAlgebraic.charCodeAt(0) >= '1'.charCodeAt(0) && fromAlgebraic.charCodeAt(0) <= '8'.charCodeAt(0)) {
                            filteredIndexes = this.getFilteredIndexes(pieces, { rank: 9 - parseInt(fromAlgebraic), color, type: pieceType, legalMoves: [to] });
                        } else {
                            filteredIndexes = this.getFilteredIndexes(pieces, { file: (fromAlgebraic.charCodeAt(0) - 'a'.charCodeAt(0) + 1), color, type: pieceType, legalMoves: [to] });
                        }
                        
                        if (filteredIndexes) {
                            from = filteredIndexes[0];
                        }
                    }
                }

                if (from === -1) {
                    let pieceFilters: Partial<Piece> = {
                        color,
                        type: pieceType 
                    };
                    if (!castlingSide) {
                        pieceFilters.legalMoves = [to];
                        // TODO handle legalMoves another way
                    }
                    const matchingIndexes = this.getFilteredIndexes(pieces, pieceFilters);

                    if (matchingIndexes.length) {
                        from = matchingIndexes[0];
                    }
                }
            } else {
                console.log('Parsing algebraic move failed');
            }

            return ({
                pieces,
                from,
                to,
                isCapture: false,
                isCheck,
                isCheckmate,
                castlingSide,
                promotionType,
                algebraicNotation: algebraicMove,
                fen,
                sound,
                mark: -1
            });
        }
    }

    /**
     * Method for converting PGN tags into PGN tags string
     * 
     * @param tags 
     */
    public static getPgnTags(tags: PgnTags) : string {
        let pgnTags = `[Event "${tags.event ?? '-'}"]\n`;
        pgnTags    += `[Site "${tags.site ?? 'Chess Trainer'}"]\n`;
        pgnTags    += `[Date "${tags.date ?? moment().format('YYYY.MM.DD')}"]\n`;
        pgnTags    += `[Round "${tags.round}"]\n`;
        pgnTags    += `[White "${tags.white}"]\n`;
        pgnTags    += `[Black "${tags.black}"]\n`;
        pgnTags    += `[Result "${tags.result ?? '-'}"]\n`;
        
        return pgnTags;
    }

    /**
     * Method for converting PGN tags and moves history into PGN string
     * 
     * @param tags
     * @param pieces
     * @param moves
     * @returns 
     */
    public static getPGN(tags: PgnTags, moves: Move[]) : string {
        let pgn = this.getPgnTags(tags) + '\n';

        for (let i = 0; i < moves.length; i++) {
            const pieceType = this.getMoveType(moves[i]) === PIECE_TYPE.PAWN || ['B', 'K', 'N', 'R', 'Q'].includes(moves[i].algebraicNotation[0]) ? '' : this.getMoveType(moves[i]).toUpperCase();
            if (this.getMoveColor(moves[i]) === PIECE_COLOR.WHITE) {
                pgn += `${Math.floor(i / 2) + 1}. ${pieceType}${moves[i].algebraicNotation} `;
            } else {
                pgn += `${pieceType}${moves[i].algebraicNotation} `;
            }
        }
        return pgn.trimEnd();
    }

    /**
     * Method for updating castling rights for given color
     * 
     * @param pieces 
     * @param color 
     * @param currentRights 
     * @returns 
     */
    public static updateCastlingRights(pieces: Pieces, color: PIECE_COLOR, currentRights: CASTLING_SIDE[]) {
        //Determine castling rank
        const r = color === PIECE_COLOR.WHITE ? 8 : 1;

        if (!pieces[this.c2i(r, 5)]) {
            //King has moved, no castling rights
            return [];
        }

        if (!pieces[this.c2i(r, 8)]) {
            //Kingside rook has moved, no kingside castling rights
            _.pull(currentRights, CASTLING_SIDE.KINGSIDE);
        }

        if (!pieces[this.c2i(r, 1)]) {
            //Queenside rook has moved, no queenside castling rights
            _.pull(currentRights, CASTLING_SIDE.QUEENSIDE);
        }

        return currentRights;
    }

    /**
     * Method for checking whether given color can perform castling 
     * on given side
     * 
     * @param pieces 
     * @param color 
     * @param side 
     * @returns 
     */
    public static canCastle(pieces: Pieces, color: PIECE_COLOR, side: CASTLING_SIDE) {
        //Determine castling rank
        const r = color === PIECE_COLOR.WHITE ? 8 : 1;
        const oppositeColor = color === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;

        /**
         * Squares that must be empty for given castling side in order 
         * to perform castling
         */
        let checks = [[r, 6], [r, 7]];
        if (side === CASTLING_SIDE.QUEENSIDE) {
            checks = [[r, 2], [r, 3], [r, 4]];
        }

        for (const [i, j] of checks) {
            if (pieces[this.c2i(i, j)]) {
                //Square is not empty, can't castle
                return false;
            }
        }

        //Check if squares between are attacked
        if (side === CASTLING_SIDE.QUEENSIDE) {
            if (this.isSquareAttacked(pieces, oppositeColor, [r, 4])) {
                return false;
            }
        } else {
            if (this.isSquareAttacked(pieces, oppositeColor, [r, 6])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Method for detecting if given color is in check
     * 
     * @param pieces 
     * @param color 
     * @returns 
     */
    public static detectCheck(pieces: Pieces, color: PIECE_COLOR) {
        const oppositeColor = color === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;
        const kingIndex = this.getKingIndex(pieces, color);
        if (kingIndex && this.isSquareAttacked(pieces, oppositeColor, this.i2c(kingIndex))) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Method for detecting if given color is checkmated, i. e. has no legal
     * moves and at the same time opposite color has at least one legal move
     * 
     * @param pieces 
     * @param color 
     * @param legalMoves
     * @returns 
     */
    public static detectCheckmate(pieces: Pieces, color: PIECE_COLOR, legalMoves: number[][]) {
        const hasOpponentLegalMoves = pieces.find((piece, n) => piece && this.getColor(piece) === color && legalMoves[n]) !== undefined;
        const hasLegalMoves = pieces.find((piece, n) => piece && this.getColor(piece) !== color && legalMoves[n]) !== undefined;
        return hasOpponentLegalMoves && !hasLegalMoves;
    }

    /**
     * Method for getting the king's square of given color
     * 
     * @param pieces 
     * @param color 
     * @returns 
     */
    private static getKingIndex(pieces: Pieces, color: PIECE_COLOR) {
        return pieces.indexOf(color === PIECE_COLOR.WHITE ? 'K' : 'k');
    }

    /**
     * Method for computing legal moves and captures of a piece
     * 
     * @param pieces 
     * @param n 
     * @param castlingRights 
     * @param lastMove 
     * @returns 
     */
    public static computeLegalMoves(pieces: Pieces, n: number, castlingRights: CASTLING_SIDE[], lastMove: Move) {
        let legalMoves: number[] = [];

        if (!pieces[n]) {
            return legalMoves;
        }
        const pseudoLegalMoves = this.computePseudoLegalMoves(pieces, n, castlingRights, lastMove);

        const color = this.getColor(pieces[n]);
        const oppositeColor = color === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;

        /**
         * We perform each pseudo-legal move and check whether this move causes an attack on the
         * king, if so, it is illegal, otherwise, we mark it as a legal move
         */
        for (const p of pseudoLegalMoves) {
            let piecesCopy = this.makeMove([...pieces], n, p);

            if (!this.isSquareAttacked(piecesCopy, oppositeColor, this.i2c(this.getKingIndex(piecesCopy, color)))) {
                legalMoves.push(p);
            }
        }

        return legalMoves;
    }

    /**
     * Method for performing a move
     * 
     * @param pieces 
     * @param n 
     * @param m 
     */
    public static makeMove(pieces: Pieces, x: number | Square, y: number | Square) {
        const n = Array.isArray(x) ? this.c2i(...x) : x;
        const m = Array.isArray(y) ? this.c2i(...y) : y;

        if (n != m && pieces[n]) {
            pieces[m] = pieces[n];
            pieces[n] = '';
        }

        return pieces;
    }

    /**
     * Method for computing pseudo-legal moves and captures of a piece
     * 
     * @param pieces 
     * @param n 
     * @param castlingRights 
     * @param lastMove 
     * @returns 
     */
    private static computePseudoLegalMoves(pieces: Pieces, n: number, castlingRights: CASTLING_SIDE[], lastMove: Move) : number[] {
        const [i, j] = this.i2c(n);
        const color = this.getColor(pieces[n]);
        const type = this.getType(pieces[n]);
        const isWhite = color === PIECE_COLOR.WHITE
        const oppositeColor = color === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;

        let pseudoLegalMoves: Square[] = [];

        /**
         * Computing pseudo-legal moves and captures for pawns is done separately, 
         * because they distinct much from other pieces moves and captures
         */
        if (type === PIECE_TYPE.PAWN) {
            let d = -1; //for white color
            if (!isWhite) {
                d = 1; //for black color
            }
            if ((isWhite && i > 1) || (!isWhite && i < 8)) {
                //Pseudo-legal moves for pawn
                if (!pieces[this.c2i(i + d, j)]) {
                    pseudoLegalMoves.push([i + d, j]);
                    if (((isWhite && i === 7) || (!isWhite && i === 2)) && !pieces[this.c2i(i + 2 * d, j)]) {
                        pseudoLegalMoves.push([i + 2 * d, j]);
                    }
                }

                //Pseudo-legal captures for pawn
                const p1 = pieces[this.c2i(i + d, j - 1)];
                const p2 = pieces[this.c2i(i + d, j + 1)];

                if (j > 1 && p1 && this.getColor(p1) === oppositeColor) {
                    pseudoLegalMoves.push([i + d, j - 1]);
                }
                if (j < 8 && p2 && this.getColor(p2) === oppositeColor) {
                    pseudoLegalMoves.push([i + d, j + 1]);
                }

                //Check if en passant is a pseudo-legal capture
                const fromRank = isWhite ? 2 : 7;
                const toRank = isWhite ? 4 : 5;

                if (i === toRank && this.getType(pieces[lastMove.to]) === PIECE_TYPE.PAWN && this.getColor(pieces[lastMove.to]) === oppositeColor) {
                    const fx = this.i2c(lastMove.from)[0];
                    const [tx, ty] = this.i2c(lastMove.to);
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
            if ([PIECE_TYPE.QUEEN, PIECE_TYPE.KING].includes(type)) {
                reachedEnd = new Array(8).fill(false);
            }
            
            /**
             * Here we define maximum checking length for each direction, 
             * in case of bishop, rook and queen maximum length can be up
             * to 7 for each direction and for knight and king direction
             * length is always 1
             */
            let range = Math.max(Math.max(i, 8 - i), Math.max(j, 8 - j));
            if ([PIECE_TYPE.KING, PIECE_TYPE.KNIGHT].includes(type)) {
                range = 1;
            }

            //Iteration variable s always satisfies 1 <= s <= 7
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
                * either on square [1, 5] or on square [8, 5]
                */
                if (castlingRights && (i === 8 || i === 1) && j === 5) {
                    const sides = [CASTLING_SIDE.KINGSIDE, CASTLING_SIDE.QUEENSIDE];

                    for (const side of sides) {
                        //Check if color has castling rights on current side
                        if (castlingRights.includes(side)) {
                            //Check if castling is possible
                            if (this.canCastle(pieces, color, side)) {
                                const d = side === CASTLING_SIDE.KINGSIDE ? 2 : -2;
                                //Add additional king pseudo-legal move for kingside castling
                                checks[PIECE_TYPE.KING].push([i, j + d]);
                            }
                        }
                    }
                }

                checks[type].forEach(([a, b]: [number, number], c: number) => {
                    //First we check if we are still in our board
                    if (!reachedEnd[c] && 1 <= a && a <= 8 && 1 <= b && b <= 8) {
                        const occupyingPiece = pieces[this.c2i(a, b)];
                        if (occupyingPiece) {
                            /**
                             * Piece is in a way on current direction, we mark
                             * search in this direction as completed
                             */
                            reachedEnd[c] = true;

                            if (this.getColor(occupyingPiece) == oppositeColor) {
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

        return pseudoLegalMoves.map(coordinates => this.c2i(...coordinates));
    }

    /**
     * Method for finding square marked as active
     * 
     * @param board 
     * @returns 
     */
    public static getActiveSquare(board: Board) {
        for (const square of board) {
            if (square.active) {
                return board.indexOf(square);
            }
        }
        return -1;
    }

    /**
     * Method for detecting any attack by given color on given square
     * 
     * @param pieces 
     * @param color 
     * @param param2 
     * @returns 
     */
    private static isSquareAttacked(pieces: Pieces, color: PIECE_COLOR, [i, j]: Square) : boolean {
        const d = color === PIECE_COLOR.WHITE ? 1 : -1;
        for (let k = 0; k < 3; k++) {
            const shortRangeChecks: any = [
                [[i + d, j - 1], [i + d, j + 1]], //pawn
                [[i-2, j-1], [i-2, j+1], [i+2, j-1], [i+2, j+1], [i-1, j-2], [i-1, j+2], [i+1, j-2], [i+1, j+2]], //knight
                [[i-1, j-1], [i-1, j+1], [i+1, j-1], [i+1, j+1], [i, j-1], [i, j+1], [i-1, j], [i+1, j]], //king
            ];
            for (let n = 0; n < shortRangeChecks[k].length; n++) {
                const [a, b] = shortRangeChecks[k][n];
                if (1 <= a && a <= 8 && 1 <= b && b <= 8) {
                    const piece = pieces[this.c2i(a, b)];
                    const pieceColor = this.getColor(piece);
                    const pieceType = this.getType(piece);

                    if (piece && pieceColor === color) {
                        if (k === 0 && pieceType === PIECE_TYPE.PAWN) {
                            return true;
                        }
                        if (k === 1 && pieceType == PIECE_TYPE.KNIGHT) {
                            return true;
                        }
                        if (k === 2 && pieceType == PIECE_TYPE.KING) {
                            return true;
                        }
                    }
                }
            }
        }

        for (let k = 0; k < 2; k++) {
            let reachedEnd = new Array(4).fill(false);
            let range = Math.max(Math.max(i, 8 - i), Math.max(j, 8 - j));

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
                    if (!reachedEnd[n] && 1 <= a && a <= 8 && 1 <= b && b <= 8) {
                        const piece = pieces[this.c2i(a, b)];
                        const pieceColor = this.getColor(piece);
                        const pieceType = this.getType(piece);

                        if (piece) {
                            if (pieceColor === color) {
                                if (k === 0 && [PIECE_TYPE.BISHOP, PIECE_TYPE.QUEEN].includes(pieceType)) {
                                    return true;
                                }
                                if (k === 1 && [PIECE_TYPE.ROOK, PIECE_TYPE.QUEEN].includes(pieceType)) {
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
     * 
     * @param pieces 
     * @param variation 
     * @returns 
     */
    public static getVariationData(pieces: Pieces, variation: string, castlingRightsWhite: CASTLING_SIDE[], castlingRightsBlack: CASTLING_SIDE[], legalMoves: number[][], oneMoveLimit?: boolean) {
        const algebraicMoves = oneMoveLimit ? variation.split(' ')[0] : variation.split(' ');
        let variationData: Move[] = [];

        for (const algebraicMove of algebraicMoves) {
            const algebraicFrom = algebraicMove.substring(0, 2);
            const algebraicTo = algebraicMove.substring(2);
            const n = this.a2i(algebraicFrom);
            const m = this.a2i(algebraicTo);
            
            if (pieces[n]) {
                const oppositeColor = this.getColor(pieces[n]) === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;

                let move: Move = {
                    pieces,
                    from: n,
                    to: m,
                    isCapture: !!pieces[m],
                    isCheck: false,
                    isCheckmate: false,
                    castlingSide: false,
                    promotionType: PIECE_TYPE.NONE,
                    algebraicNotation: '',
                    fen: '',
                    sound: -1,
                    mark: -1
                };

                if (this.getColor(pieces[n]) == PIECE_COLOR.WHITE) {
                    this.makeMove(pieces, n, m);
                    //compute legalmoves
                    castlingRightsWhite = this.updateCastlingRights(pieces, PIECE_COLOR.WHITE, castlingRightsWhite);
                } else {
                    this.makeMove(pieces, n, m);
                    //compute legalmoves
                    castlingRightsBlack = this.updateCastlingRights(pieces, PIECE_COLOR.BLACK, castlingRightsBlack);
                }

                move.isCheck = this.detectCheck(pieces, oppositeColor);
                move.isCheckmate = this.detectCheckmate(pieces, oppositeColor, legalMoves);
    
                move.algebraicNotation = this.moveToAlgebraic(move, legalMoves);
    
                variationData.push(move);
            } else {
                //Error
            }
        }

        return ({
            moves: variationData.splice(0, 8),
            pieces
        });
    }

    /**
     * Finds opening data based on given algebraic move list
     * 
     * @param movesAlgebraic 
     * @returns 
     */
    public static getOpeningData(movesAlgebraic: string) {
        let openingData : OpeningData = {
            name: 'None',
            eco: '',
            fen: '',
            movesAlgebraic: ''
        };
        let moveslength = 0;

        for (const opening of eco) {
            const openingMovesAlgebraic = opening.movesAlgebraic.slice(0, movesAlgebraic.length);
            if (movesAlgebraic.startsWith(openingMovesAlgebraic) && openingMovesAlgebraic.length > moveslength) {
                moveslength = openingMovesAlgebraic.length;
                openingData = opening;
            }
        }
        
        return openingData;
    }

    /**
     * Computes move feedback for given move
     * 
     * @param moves 
     * @param movesAlgebraic 
     * @param openingData 
     * @param currentMoveIndex 
     * @param variations 
     * @returns 
     */
    public static getMoveFeedback(moves: Move[], movesAlgebraic: string, openingData: OpeningData, currentMoveIndex: number, variations: Variation[]) : MOVE_MARK {
        if (openingData.movesAlgebraic.includes(movesAlgebraic)) {
            return MOVE_MARK.BOOK;
        } else if (moves.length > 1 && currentMoveIndex && moves[currentMoveIndex - 1].bestNextMove) {
            const previousMove = moves[currentMoveIndex - 1].bestNextMove;

            if (previousMove && previousMove.move) {
                const previousEval = previousMove.mate ? previousMove.eval + 100 : previousMove.eval;
                const currentEval = variations[0].mate ? variations[0].eval + 100 : variations[0].eval;

                const evalDifference = Math.abs(currentEval - previousEval);

                if (previousMove.move.from == moves[currentMoveIndex].from && previousMove.move.to == moves[currentMoveIndex].to) {
                    return MOVE_MARK.BEST_MOVE;
                } else if (evalDifference < 0.7) {
                    return MOVE_MARK.EXCELLENT;
                } else if (evalDifference < 1) {
                    return MOVE_MARK.GOOD;
                } else if (evalDifference < 1.5) {
                    return MOVE_MARK.INACCURACY;
                } else if (evalDifference < 2) {
                    return MOVE_MARK.MISTAKE;
                } else {
                    return MOVE_MARK.BLUNDER;
                }
            } else {
                console.log(`Error, moves[${currentMoveIndex - 1}].bestNextMove is undefined`);
            }
        }

        return MOVE_MARK.NONE;
    }
}
