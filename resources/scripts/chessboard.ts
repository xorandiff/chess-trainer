import { PIECE_TYPE, PIECE_COLOR, CASTLING_SIDE, SOUND_TYPE, MOVE_MARK, ERROR_TYPE } from '@/enums';
import Error from '@/errors';
import _, { initial } from 'lodash';
import moment from 'moment';
import eco from "./eco.json";

export default class Chessboard {
    /**
     * Return piece color
     * 
     * @param piece 
     * @returns 
     */
    public static getColor(piece: string) {
        return piece.toLowerCase() == piece ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;
    }

    /**
     * Returns piece type
     * 
     * @param piece 
     * @returns 
     */
    public static getType(piece: string) {
        switch (piece.toLowerCase()) {
            case "k": return PIECE_TYPE.KING;
            case "n": return PIECE_TYPE.KNIGHT;
            case "b": return PIECE_TYPE.BISHOP;
            case "q": return PIECE_TYPE.QUEEN;
            case "p": return PIECE_TYPE.PAWN;
            case "r": return PIECE_TYPE.ROOK;
            default: return PIECE_TYPE.NONE;
        }
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
     * Converts rank and file coordinates into algebraic coordinates
     * 
     * @param rank 
     * @param file 
     * @returns 
     */
    public static c2a(rank: number, file: number) {
        return this.i2a(this.c2i(rank, file));
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
     * Converts algebraic coordinates into index coordinates
     * 
     * @param algebraicSquare 
     * @returns 
     */
    public static a2i(algebraicSquare: string) {
        const [rank, file] = this.a2c(algebraicSquare);

        return this.c2i(rank, file);
    }

    /**
     * Converts algebraic coordinates into rank and file coordinates
     * 
     * @param algebraicSquare 
     * @returns 
     */
    public static a2c(algebraicSquare: string) {
        const rank = 9 - parseInt(algebraicSquare[1]);
        const file = algebraicSquare.charCodeAt(0) - 'a'.charCodeAt(0) + 1;

        return [rank, file];
    }

    /**
     * Converts each of given coordinates in any of supported formats 
     * into respective index coordinates
     * 
     * @param coordinatesArray 
     */
    public static toIndex(...coordinatesArray: Coordinates[]) {
        let indexesArray = [];

        for (const coordinate of coordinatesArray) {
            if (typeof coordinate === "number") {
                indexesArray.push(coordinate);
            } else if (typeof coordinate === "string") {
                indexesArray.push(this.a2i(coordinate));
            } else {
                indexesArray.push(this.c2i(...coordinate));
            }
        }

        return indexesArray;
    }

    /**
     * Returns file and rank distances between given coordinates
     * 
     * @param x 
     * @param y 
     * @returns 
     */
    public static squareDistance(x: number | string, y: number | string) {
        const [a, b] = typeof x === "string" ? this.a2c(x) : this.i2c(x);
        const [c, d] = typeof y === "string" ? this.a2c(y) : this.i2c(y);

        return [Math.abs(a - c), Math.abs(b - d)];
    }

    /**
     * Returns opposite color
     * 
     * @param color 
     * @returns 
     */
    public static oppositeColor(color: PIECE_COLOR | "w" | "b") {
        return color == "w" ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;
    }

    /**
     * Method for converting FEN string into pieces 
     * array
     * 
     * @param fen 
     * @returns 
     */
    public static fenToPieces(fen: string) {
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
     * Method for converting pieces array into pieces 
     * segment of FEN string 
     * 
     * @param pieces 
     * @returns 
     */
    public static piecesToFen(pieces: Pieces) {
        const piecesWhitespaces = pieces.map(p => p ? p : ' ');     // Replace '' with ' '
        return _.chunk(piecesWhitespaces, 8)                        // Divide into chunks of length 8
                .map(row => {
                    return row.join('')                             // Join into single string
                              .split(/\b/)                          // Split by word boundaries
                              .map(x => {
                                if (x.includes(' ')) {
                                    return x.length;                // Replace whitespaces with their amount
                                }
                                return x;
                              })
                              .join('');                            // Join back into one string
                })
                .join('/');                                         // Join rows with slashes
    }

    /**
     * Method for creating a FEN string from 
     * pieces array and rest of  necessary board 
     * data
     * 
     * @param pieces 
     * @param castlingRights
     * @param halfmoves 
     * @param fullmoves 
     * @param currentTurnColor 
     * @param lastMove 
     */
    public static getFen(pieces: Pieces, castlingRights: string, halfmoves: number, fullmoves: number, currentTurnColor: PIECE_COLOR, lastMove: Move) {
        let fenPieces = this.piecesToFen(pieces);

        let enPassantAlgebraic = '-';
        if (lastMove.type === PIECE_TYPE.PAWN && this.squareDistance(lastMove.from, lastMove.to)[0] === 2) {
            enPassantAlgebraic = this.i2a(lastMove.to);
        }

        return `${fenPieces} ${currentTurnColor} ${castlingRights ? castlingRights : '-'} ${enPassantAlgebraic} ${halfmoves} ${fullmoves}`;
    }

    /**
     * Method for creating move data from an algebraic moves list
     * 
     * @param algebraicMoves 
     * @param previousMove 
     * @returns 
     */
    public static createMoves(algebraicMoves: string, previousMove: Move) {
        let { halfmoves, fullmoves } = previousMove;
        let moves = [ previousMove ];

        const movesAlgebraic = algebraicMoves.match(/[BRKQN]?[a-h]?[1-8]?x?[BRKQN]?[a-h][1-8]=?[BRKQN]?\+?#?|O-O-O|O-O/g)!;

        for (const moveAlgebraic of movesAlgebraic) {
            let { color, castlingRights, pieces } = moves[moves.length - 1];
            pieces = [ ...pieces ];
            
            let move = this.algebraicToMove(moves[moves.length - 1], moveAlgebraic)!;
            const pieceType = this.getType(pieces[move.from]);

            // Update fullmove and halfmove clocks
            if (color === PIECE_COLOR.BLACK) {
                fullmoves++;
                halfmoves = pieceType === PIECE_TYPE.PAWN || move.isCapture ? 0 : halfmoves + 1;
            }

            // If castling, then move rook to the castled position
            pieces = this.setRookCastlePosition(move);

            // Perform a move
            move.pieces = this.makeMove(pieces, move.from, move.to);

            // Update castling rights
            move.castlingRights = this.updateCastlingRights(pieces, castlingRights); 

            const rankDistance = this.squareDistance(move.from, move.to)[0];
            const pawnMovedTwoSquares = pieceType === PIECE_TYPE.PAWN && rankDistance === 2;

            // Create FEN for current move
            const fenSegments = [
                this.piecesToFen(move.pieces),                      // Create FEN pieces list
                move.color,                                         // Current turn color
                move.castlingRights ? move.castlingRights : '-',    // Castling rights
                pawnMovedTwoSquares ? this.i2a(move.to) : '-',      // En passant target square
                halfmoves,                                          // Halfmove clock
                fullmoves                                           // Fullmove clock
            ];
            move.fen = fenSegments.join(' ');

            moves.push(move);
        }
        
        return moves.slice(1);
    }

    /**
     * Sets castled position for a rook, if move is castle
     * 
     * @param move 
     * @returns 
     */
    public static setRookCastlePosition(move: Move) {
        if (move.castlingSide) {
            const r = move.color === PIECE_COLOR.WHITE ? 8 : 1;
            const f1 = move.castlingSide === 'k' ? 'h' : 'a';
            const f2 = move.castlingSide === 'k' ? 'f' : 'd';

            const rookFrom = this.a2i(`${f1}${r}`);
            const rookTo = this.a2i(`${f2}${r}`);

            return this.makeMove(move.pieces, rookFrom, rookTo);
        }

        return move.pieces;
    }

    /**
     * Method for parsing PGN tags from PGN string
     * 
     * @param pgn 
     * @returns 
     */
    public static parsePgnTags(pgn: string) {
        let tags: PgnTags = {
            event: '',
            site: '',
            date: '',
            round: '',
            white: '',
            black: '',
            result: ''
        };

        for (const row of pgn.split("\n")) {
            const matches = row.match(/\[(\w+)\s+"(.+)"\]/i);
            if (matches) {
                const tagName = matches[1];
                const tagValue = matches[2];

                switch (tagName.toLowerCase()) {
                    case 'event': tags.event = tagValue; break;
                    case 'site': tags.site = tagValue; break;
                    case 'date': tags.date = tagValue; break;
                    case 'round': tags.round = tagValue; break;
                    case 'white': tags.white = tagValue; break;
                    case 'black': tags.black = tagValue; break;
                    case 'result': tags.result = tagValue; break;
                    case 'fen': tags.fen = tagValue; break;
                    case 'firstmove': tags.firstMove = tagValue; break;
                    case 'full': tags.solution = tagValue; break;
                    default: break;
                }
            }
        }

        return tags;
    }

    /**
     * Method for creating new store state from FEN or PGN
     * 
     * @param fenOrPgn 
     * @returns 
     */
    public static create(fenOrPgn?: string) {
        let fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        let color = PIECE_COLOR.BLACK;
        let halfmoves = 0;
        let fullmoves = 1;
        let castlingRights = 'KQkq';

        if (fenOrPgn) {
            if (fenOrPgn.includes('[')) {
                const tags = this.parsePgnTags(fenOrPgn);
                if (tags.fen) {
                    fen = tags.fen;
                }
            } else {
                fen = fenOrPgn;
            }

            const fields = fen.split(' ');
            color = fields[1] == PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;
            castlingRights = fields[2];
            halfmoves = parseInt(fields[4]);
            fullmoves = parseInt(fields[5]);
        }

        const pieces = this.fenToPieces(fen);

        const initialMove: Move = {
            pieces,
            fen,
            from: 0,
            to: 0,
            color,
            type: PIECE_TYPE.NONE,
            fullmoves,
            halfmoves,
            castlingRights,
            legalMoves: pieces.map((p, i) => p ? this.computeLegalMoves(pieces, i, castlingRights, fen) : []),
            isCapture: false,
            isCheck: false,
            isCheckmate: false,
            castlingSide: '',
            promotionType: PIECE_TYPE.NONE,
            algebraicNotation: '',
            mark: -1
        };

        let moves = [ initialMove ];

        if (fenOrPgn && fenOrPgn.includes('[')) {
            // PGN
            const pgnMoves = fenOrPgn.slice(fenOrPgn.lastIndexOf(']') + 1).trim();

            moves = moves.concat(this.createMoves(pgnMoves, initialMove));
        }
        
        return moves;
    }

    /**
     * Method for computing position of an arrow
     * 
     * @param n 
     * @param m 
     * @returns 
     */
    public static getArrowCoordinates(n: number, m: number) {
        let [a, b] = this.i2c(n);
        let [c, d] = this.i2c(m);

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
    public static getFilteredIndexes(pieces: Pieces, piecePartial: Partial<Piece>) {
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
     * @param legalMoves 
     * @returns 
     */
    public static moveToAlgebraic(move: Move, legalMoves: number[][]) : string {
        const pieceType = move.type as PIECE_TYPE;

        let pieceString = move.pieces[move.from].toUpperCase();
        if (!move.isCapture && (pieceType == PIECE_TYPE.PAWN || move.promotionType)) {
            pieceString = '';
        }
        if (move.isCapture && (pieceType == PIECE_TYPE.PAWN || move.promotionType)) {
            pieceString = this.i2a(move.from)[0];
        }

        let onSquare = '';
        if (pieceType != PIECE_TYPE.PAWN) {
            let piecesOfType = move.pieces.map(p => pieceType == p ? p : '');

            //We now check if there are at least two pieces of the same type
            if (piecesOfType.filter(p => p.length > 0).length > 1) {
                //We exclude our current piece from this list
                piecesOfType[move.from] = '';

                //We left only pieces which can go to the same square
                piecesOfType = piecesOfType.map((p, i) => legalMoves[i].includes(move.to) ? p : '');

                if (piecesOfType.filter(p => p.length).length > 0) {
                    piecesOfType = piecesOfType.map((p, i) => i % 8 === move.from % 8 ? p : '');
                    if (!piecesOfType.filter(p => p.length)) {
                        /**
                         * There are no other pieces on the same file, so file is enough 
                         * to disambiguate move
                         */
                        onSquare = this.i2a(move.from)[0];
                    } else {
                        piecesOfType = piecesOfType.map((p, i) => ((i / 8) >> 0) === ((move.from / 8) >> 0) ? p : '');
                        if (!piecesOfType.filter(p => p.length)) {
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

        if (move.promotionType) {
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
     * Method for converting algebraic move notation into move coordinates 
     * along with returning capture, castle and promotion data
     * 
     * @param previousMove 
     * @param algebraicMove 
     * @returns 
     */
    public static algebraicToMove(previousMove: Move, algebraicMove: string) {
        const groups = algebraicMove.match(/(N|K|R|B|Q)?([a-h]?[1-8]?)?(x)?([a-h][1-8])?(=[N|K|R|B|Q])?(O-O-O|O-O)?(\+|#)?/);

        if (groups) {
            let from = -1;
            let to = -1;
            
            let fromAlgebraic = groups[2];
            let toAlgebraic = groups[4];

            const pieceColor = this.oppositeColor(previousMove.color);
            let pieceType = groups[1] !== undefined ? this.getType(groups[1]) : PIECE_TYPE.PAWN;
            const isCapture = groups[3] !== undefined;
            const promotionType = groups[5] !== undefined ? this.getType(groups[5][1]) : PIECE_TYPE.NONE;
            
            let castlingSide: Move["castlingSide"] = '';
            if (groups[6]) {
                castlingSide = groups[6] == 'O-O' ? 'k' : 'q';
                pieceType = PIECE_TYPE.KING;

                const castlingRank = pieceColor === PIECE_COLOR.WHITE ? 1 : 8;
                const castlingFile = castlingSide === 'k' ? 'g' : 'c';
                toAlgebraic = `${castlingFile}${castlingRank}`;
            }
            const isCheck = groups[7] === '+';
            const isCheckmate = groups[7] === '#';

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
                            filteredIndexes = this.getFilteredIndexes(previousMove.pieces, { rank: 9 - parseInt(fromAlgebraic), color: pieceColor, type: pieceType }).filter(i => previousMove.legalMoves[i].includes(to));
                        } else {
                            filteredIndexes = this.getFilteredIndexes(previousMove.pieces, { file: (fromAlgebraic.charCodeAt(0) - 'a'.charCodeAt(0) + 1), color: pieceColor, type: pieceType }).filter(i => previousMove.legalMoves[i].includes(to));
                        }
                        
                        if (filteredIndexes) {
                            from = filteredIndexes[0];
                        }
                    }
                }

                if (from === -1) {
                    let pieceFilters: Partial<Piece> = {
                        color: pieceColor,
                        type: pieceType 
                    };

                    let matchingIndexes = this.getFilteredIndexes(previousMove.pieces, pieceFilters);

                    if (!castlingSide) {
                        matchingIndexes = matchingIndexes.filter(i => previousMove.legalMoves[i].includes(to));
                    }

                    console.log(matchingIndexes);

                    if (matchingIndexes.length) {
                        from = matchingIndexes[0];
                    }
                }
            } else {
                console.log('Parsing algebraic move failed');
            }

            

            return ({
                ...previousMove,
                from,
                to,
                color: pieceColor,
                isCapture,
                isCheck,
                isCheckmate,
                castlingSide,
                promotionType,
                algebraicNotation: algebraicMove,
                fen: ''
            });
        }
    }

    /**
     * Method for converting PGN tags into PGN tags string
     * 
     * @param tags 
     */
    public static getPgnTags(tags: PgnTags) {
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
     * @param moves
     * @returns 
     */
    public static getPGN(tags: PgnTags, moves: Move[]) : string {
        let pgn = this.getPgnTags(tags) + '\n';

        for (let i = 0; i < moves.length; i++) {
            const pieceType = moves[i].type === PIECE_TYPE.PAWN || ['B', 'K', 'N', 'R', 'Q'].includes(moves[i].algebraicNotation[0]) ? '' : moves[i].type.toUpperCase();
            if (moves[i].color === PIECE_COLOR.WHITE) {
                pgn += `${Math.floor(i / 2) + 1}. ${pieceType}${moves[i].algebraicNotation} `;
            } else {
                pgn += `${pieceType}${moves[i].algebraicNotation} `;
            }
        }
        return pgn.trimEnd();
    }

    /**
     * Method for updating castling rights
     * 
     * @param pieces 
     * @param currentRights 
     * @returns 
     */
    public static updateCastlingRights(pieces: Pieces, currentRights: string) {
        if (!currentRights) {
            return currentRights;
        }

        if (!pieces[this.c2i(8, 5)]) {
            // White king has moved, no castling rights for white
            currentRights = currentRights.replace('K', '').replace('Q', '');
        }

        if (!pieces[this.c2i(8, 8)]) {
            // Kingside white rook has moved or been captured, no kingside castling rights for white
            currentRights = currentRights.replace('K', '');
        }

        if (!pieces[this.c2i(8, 1)]) {
            // Queenside white rook has moved or been captured, no queenside castling rights for white
            currentRights = currentRights.replace('Q', '');
        }

        if (!pieces[this.c2i(1, 5)]) {
            // Black king has moved, no castling rights for black
            currentRights = currentRights.replace('k', '').replace('k', '');
        }

        if (!pieces[this.c2i(1, 8)]) {
            // Kingside black rook has moved or been captured, no kingside castling rights for black
            currentRights = currentRights.replace('k', '');
        }

        if (!pieces[this.c2i(1, 1)]) {
            // Queenside black rook has moved or been captured, no queenside castling rights for black
            currentRights = currentRights.replace('q', '');
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
    public static canCastle(pieces: Pieces, color: PIECE_COLOR, side: string) {
        // Determine castling rank
        const r = color === PIECE_COLOR.WHITE ? 8 : 1;
        const oppositeColor = color === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;
        const queensideRight = color === PIECE_COLOR.WHITE ? 'Q' : 'q';

        /**
         * Squares that must be empty for given castling side in order 
         * to perform castling
         */
        let checks = [[r, 6], [r, 7]];
        if (side === queensideRight) {
            checks = [[r, 2], [r, 3], [r, 4]];
        }

        for (const [i, j] of checks) {
            if (pieces[this.c2i(i, j)]) {
                // Square is not empty, can't castle
                return false;
            }
        }

        //Check if squares between are attacked
        if (side === queensideRight) {
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
     * @param fen 
     * @returns 
     */
    public static computeLegalMoves(pieces: Pieces, n: number, castlingRights: string, fen: string) {
        let legalMoves: number[] = [];

        if (!pieces[n]) {
            return legalMoves;
        }
        const pseudoLegalMoves = this.computePseudoLegalMoves(pieces, n, castlingRights, fen);

        const color = this.getColor(pieces[n]);
        const oppositeColor = color === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;

        /**
         * We perform each pseudo-legal move and check whether this move causes an attack on the
         * king, if so, it is illegal, otherwise, we mark it as a legal move
         */
        for (const p of pseudoLegalMoves) {
            let piecesCopy = this.makeMove(pieces, n, p);

            if (!this.isSquareAttacked(piecesCopy, oppositeColor, this.i2c(this.getKingIndex(piecesCopy, color)))) {
                legalMoves.push(p);
            }
        }

        return legalMoves;
    }

    /**
     * Method creates a new move based on given lastMove and 
     * move coordinates.
     * 
     * @param x 
     * @param y 
     * @param lastMove 
     */
    public static createMove(x: Coordinates, y: Coordinates, lastMove: Move) {
        const [n, m] = this.toIndex(x, y);

        const [i, j] = this.i2c(n);
        const [r, f] = this.i2c(m);
        
        // Move variables
        let pieces = [ ...lastMove.pieces ];
        let castlingSide: Move["castlingSide"] = '';
        let isCapture = false;
        let promotionType = PIECE_TYPE.NONE;
        let { fullmoves, halfmoves, fen, legalMoves, castlingRights } = lastMove;
        let color = this.oppositeColor(lastMove.color);
        let oppositeColor = this.oppositeColor(color);
        const pieceType = this.getType(pieces[n]);

        //Castling
        if (pieceType === PIECE_TYPE.KING && i === r && [1, 8].includes(r) && j === 5 && (Math.abs(f - j) === 2)) {
            // Only possible files for castled king are 7 and 3
            const rookFileFrom = f === 7 ? 8 : 1;
            const rookFileTo = f === 7 ? 6 : 4;

            castlingSide = rookFileFrom === 8 ? CASTLING_SIDE.KINGSIDE : CASTLING_SIDE.QUEENSIDE;
            
            // Move rook to castled square
            pieces = this.makeMove(pieces, [i, rookFileFrom], [i, rookFileTo]);
        }

        if (pieces[m]) {
            isCapture = true;
        }

        if (pieceType === PIECE_TYPE.PAWN) {
            const enPassantTargetIndex = this.getEnPassantIndex(fen);
            if (enPassantTargetIndex === (color === PIECE_COLOR.WHITE ? m + 8 : m - 8)) {
                // En passant capture
                isCapture = true;

                // Remove captured pawn
                pieces = this.makeMove(pieces, enPassantTargetIndex, enPassantTargetIndex);
            }
        }

        // Increment fullmoves and halfmoves counters if white is moving
        if (color === PIECE_COLOR.WHITE && pieceType !== PIECE_TYPE.NONE) {
            fullmoves++;
            halfmoves++;
        }

        // Reset halfmoves counter if pawn is moving or piece is being captured
        if (pieceType === PIECE_TYPE.PAWN || pieces[m]) {
            halfmoves = 0;
        }

        // Perform the move
        pieces = this.makeMove(pieces, n, m);

        // Prepare new move data
        let move: Move = {
            pieces: [ ...lastMove.pieces ],
            fen,
            from: n,
            to: m,
            fullmoves,
            halfmoves,
            color,
            type: pieceType,
            legalMoves,
            isCapture,
            isCheck: this.detectCheck(pieces, oppositeColor),
            isCheckmate: false,
            castlingSide,
            castlingRights,
            promotionType,
            algebraicNotation: '',
            mark: -1
        };

        // Check wheter move triggers promotion
        if (pieceType === PIECE_TYPE.PAWN && [1, 8].includes(i)) {
            // Promote a pawn
            pieces[m] = promotionType;

            // Store promotion type into current move data
            move.promotionType = promotionType;
        }

        // Update castling rights before switching turn
        if (castlingRights) {
            move.castlingRights = this.updateCastlingRights(pieces, castlingRights);
        }

        // Update FEN string for current move
        move.fen = this.getFen(pieces, move.castlingRights, halfmoves, fullmoves, oppositeColor, lastMove);

        // Compute legal moves for next move
        move.legalMoves = pieces.map((p, i) => p.length ? this.computeLegalMoves(pieces, i, move.castlingRights, move.fen) : []);
        
        const hasOpponentLegalMoves = move.pieces.find((piece, n) => piece && this.getColor(piece) === oppositeColor && move.legalMoves[n]) !== undefined;
        const hasLegalMoves = move.pieces.find((piece, n) => piece && this.getColor(piece) === color && move.legalMoves[n]) !== undefined;
        move.isCheckmate = !hasOpponentLegalMoves && hasLegalMoves;
        
        move.algebraicNotation = this.moveToAlgebraic(move, lastMove.legalMoves);

        move.pieces = pieces;
        
        return move;
    }

    /**
     * Method for performing a move
     * 
     * @param pieces 
     * @param x 
     * @param y 
     */
    public static makeMove(pieces: Pieces, x: Coordinates, y: Coordinates) {
        const [n, m] = this.toIndex(x, y);

        let newPieces = [ ...pieces ];

        if (newPieces[n]) {
            newPieces[m] = newPieces[n];
            newPieces[n] = '';
        }

        return newPieces;
    }

    /**
     * Method for converting en passant target square from given 
     * FEN string into piece index
     * 
     * @param fen 
     */
    public static getEnPassantIndex(fen: string) {
        const enPassantTargetSquare = fen.split(' ')[3];

        if (enPassantTargetSquare != '-') {
            return this.a2i(enPassantTargetSquare);
        }

        return -1;
    }

    /**
     * Method for computing pseudo-legal moves and captures for 
     * piece at index n
     * 
     * @param pieces 
     * @param n 
     * @param castlingRights 
     * @param fen 
     * @returns 
     */
    private static computePseudoLegalMoves(pieces: Pieces, n: number, castlingRights: string, fen: string) : number[] {
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
                const enPassantIndex = this.getEnPassantIndex(fen);
                if (enPassantIndex >= 0) {
                    const [enPassantRank, enPassantFile] = this.i2c(enPassantIndex);

                    if (i === enPassantRank && this.getType(pieces[enPassantIndex]) === PIECE_TYPE.PAWN && this.getColor(pieces[enPassantIndex]) === oppositeColor) {
                        pseudoLegalMoves.push([i + d, enPassantFile]);
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
                    const sides = [color === PIECE_COLOR.WHITE ? 'K' : 'k', color === PIECE_COLOR.WHITE ? 'Q' : 'q'];

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
     * @param lastMove 
     * @param variation 
     * @param oneMoveLimit 
     * @returns 
     */
    public static getVariationData(lastMove: Move, variation: string, oneMoveLimit?: boolean) {
        const variationMoves = variation.trim().split(/\s+/);

        if (!variationMoves.length) {
            return [];
        }

        const algebraicMoves = oneMoveLimit ? variationMoves.slice(0, 1) : variationMoves;

        let moves: Move[] = [ lastMove ];

        for (const algebraicMove of algebraicMoves) {
            const algebraicFrom = algebraicMove.substring(0, 2);
            const algebraicTo = algebraicMove.substring(2);

            const n = this.a2i(algebraicFrom);
            const m = this.a2i(algebraicTo);

            const move = this.createMove(n, m, moves[moves.length - 1]);

            moves.push(move);
        }

        return moves.slice(1, 9);
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
            const openingMovesAlgebraic = opening.movesAlgebraic.slice(0, movesAlgebraic.length + 1);
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
