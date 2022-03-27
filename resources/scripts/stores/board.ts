import Chessboard from "@/chessboard";
import { useEngineStore } from "@/stores/engine";
import { ENGINE, SOUND_TYPE, PIECE_TYPE, PIECE_COLOR, CASTLING_SIDE } from '@/enums';
import { defineStore } from "pinia";
import { Howl } from "howler";
import _ from "lodash";
import eco from "../eco.json";

let effects : Howl[] = [];
effects[SOUND_TYPE.MOVE_SELF] = new Howl({ src: ['sounds/move_self.mp3'], preload: true });
effects[SOUND_TYPE.MOVE_OPPONENT] = new Howl({ src: ['sounds/move_opponent.mp3'], preload: true });
effects[SOUND_TYPE.MOVE_CHECK] = new Howl({ src: ['sounds/move_check.mp3'], preload: true });
effects[SOUND_TYPE.CAPTURE] = new Howl({ src: ['sounds/capture.mp3'], preload: true });
effects[SOUND_TYPE.CASTLE] = new Howl({ src: ['sounds/castle.mp3'], preload: true });
effects[SOUND_TYPE.PROMOTE] = new Howl({ src: ['sounds/promote.mp3'], preload: true });
effects[SOUND_TYPE.GAME_START] = new Howl({ src: ['sounds/game_start.mp3'], preload: true });
effects[SOUND_TYPE.GAME_END] = new Howl({ src: ['sounds/game_end.mp3'], preload: true });

export const useBoardStore = defineStore({
  id: "board",
  state: () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const chessboard = Chessboard.create(fen);
    const { board, castlingRights, halfmoves, fullmoves, color } = chessboard;
    let whitePieces = Chessboard.getPieces(board, PIECE_COLOR.WHITE);
    let blackPieces = Chessboard.getPieces(board, PIECE_COLOR.BLACK);
    let pieces = {
      [PIECE_COLOR.WHITE]: whitePieces,
      [PIECE_COLOR.BLACK]: blackPieces,
    };
    const lastMove = {} as Move;

    pieces[color].forEach(piece => {
      piece.legalMoves = Chessboard.computeLegalMoves(board, piece.square, castlingRights[PIECE_COLOR.WHITE], lastMove);
    })

    return ({
      board,
      color,
      currentTurnColor: color,
      castlingRights,
      pieces,
      halfmoves,
      fullmoves,
      lastMove,
      move: {
        [PIECE_COLOR.WHITE]: {} as Move,
        [PIECE_COLOR.BLACK]: {} as Move,
      } as Fullmove,
      moves: [] as Fullmove[],
      promotionType: PIECE_TYPE.PAWN,
      currentMove: {
        index: -1,
        color: PIECE_COLOR.WHITE
      },
      stockfish: false,
      alwaysStockfish: false,
      arrowFrom: null as Square | null,
      arrows: [] as Arrow[],
      fen,
      pgn: '',
      eco: '',
      eval: 0.0,
      promotionModalVisible: false,
      promotionMove: {
        from: [0, 0] as Square,
        to: [0, 0] as Square
      },
      dragging: -1
    });
  },
  getters: {
    oppositeColor: (state) => state.currentTurnColor === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE,
  },
  actions: {
    newGame(fen: string) {
      const chessboard = Chessboard.create(fen);
      const { board, castlingRights } = chessboard;
      const color = PIECE_COLOR.WHITE;
      this.color = PIECE_COLOR.WHITE;
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          this.board[i][j] = board[i][j];
        }
      }
      this.castlingRights = castlingRights;
      this.currentTurnColor = color;
      this.pieces = {
        [PIECE_COLOR.WHITE]: Chessboard.getPieces(this.board, PIECE_COLOR.WHITE),
        [PIECE_COLOR.BLACK]: Chessboard.getPieces(this.board, PIECE_COLOR.BLACK),
      }
      this.lastMove = {} as Move; //TODO set last move to en passant target square if present
      this.pieces[color].forEach(piece => {
        piece.legalMoves = Chessboard.computeLegalMoves(this.board, piece.square, this.castlingRights[PIECE_COLOR.WHITE], this.lastMove);
      })
      this.halfmoves = 0;
      this.fullmoves = 1;
      this.move = {
        [PIECE_COLOR.WHITE]: {} as Move,
        [PIECE_COLOR.BLACK]: {} as Move,
      } as Fullmove;
      this.moves = [] as Fullmove[];
      this.promotionType = PIECE_TYPE.PAWN;
      this.promotionModalVisible = false;
      this.promotionMove = {
        from: [0, 0] as Square,
        to: [0, 0] as Square
      };
      this.fen = fen;
    },
    loadPGN(pgn: string) {
      //TODO load game from PGN
    },
    setHighlightColor([i, j]: Square, color: string) {
      if (!this.board[i][j].highlightColor) {
        this.board[i][j].highlightColor = color;
      } else {
        this.board[i][j].highlightColor = '';
      }
    },
    pieceMouseDown([i, j]: Square) {
      if (
        this.currentMove.index === this.moves.length - 1 &&
        (this.currentMove.color !== this.currentTurnColor || !this.moves.length) &&
        this.board[i][j].piece && 
        this.board[i][j].piece!.color == this.currentTurnColor
      ) {
        this.dragging = i * 10 + j;
        this.board[i][j].active = true;
        const piece = this.pieces[this.currentTurnColor].find(piece => piece.square[0] === i && piece.square[1] === j);
        if (piece) {
          for (const [a, b] of piece.legalMoves) {
            this.board[a][b].legalMove = true;
          }
        }
      }
    },
    pieceMouseUp() {
      this.dragging = -1;
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          this.board[i][j].active = false;
          this.board[i][j].legalMove = false;
        }
      }
    },
    clearHighlights() {
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          this.board[i][j].highlight = false;
          this.board[i][j].highlightColor = '';
        }
      }
    },
    clearColoredHighlights() {
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          this.board[i][j].highlightColor = '';
        }
      }
      this.arrows = [] as Arrow[];
    },
    pieceMoveFromActive(toSquare: Square) {
      const fromSquare = Chessboard.getActiveSquare(this.board);
      if (fromSquare) {
        this.clearHighlights();

        const [r, f] = fromSquare;
        const [i, j] = toSquare;

        if (this.promotionType === PIECE_TYPE.PAWN && this.board[r][f].piece!.type === PIECE_TYPE.PAWN && ((this.board[r][f].piece!.color === PIECE_COLOR.WHITE && i === 0) || (this.board[r][f].piece!.color === PIECE_COLOR.BLACK && i === 7))) {
          /**
           * Promotion move detected, instead of performing this move, first show
           * popover for user in order to select promotion piece
           */
          this.promotionMove.from = fromSquare;
          this.promotionMove.to = toSquare;
          this.promotionModalVisible = true;
        } else {
          this.pieceMove(fromSquare, toSquare);
        }
      }
    },
    pieceMove([r, f]: Square, [i, j]: Square) {
      const piece = this.pieces[this.currentTurnColor].find(piece => piece.square[0] === r && piece.square[1] === f);
      if (piece && piece.legalMoves.find(s => s[0] === i && s[1] === j)) {
        let sound = SOUND_TYPE.MOVE_SELF;
        const oppositeColor = this.currentTurnColor === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;

        //Move variables
        let castlingSide: boolean | CASTLING_SIDE = false;
        let isCapture = false;
        let promotionType: boolean | PIECE_TYPE = false;
        let isCheck = false;
        let isCheckmate = false;

        //Castling
        if (i === r && (r === 7 || r === 0) && f === 4 && (Math.abs(f - j) === 2)) {
          //Only possible files for king are 6 and 2
          const rookFileFrom = j === 6 ? 7 : 0;
          const rookFileTo = j === 6 ? 5 : 3;

          //Move rook to castled square
          const x = _.findIndex(this.pieces[this.currentTurnColor], piece => piece.square[0] === i && piece.square[1] === rookFileFrom);
          if (x >= 0) {
            sound = SOUND_TYPE.CASTLE;
            castlingSide = rookFileFrom === 7 ? CASTLING_SIDE.KINGSIDE : CASTLING_SIDE.QUEENSIDE;
            this.pieces[this.currentTurnColor][x].square = [i, rookFileTo];
            this.board[i][rookFileTo].piece = this.board[i][rookFileFrom].piece;
            this.board[i][rookFileFrom].piece = undefined;
          }
        }

        if (this.board[r][f].piece!.type === PIECE_TYPE.PAWN && !this.board[i][j].piece && j != f) {
          //En passant capture
          isCapture = true;
          if (this.currentTurnColor === this.color) {
            this.board[i + 1][j].piece = undefined;
            _.remove(this.pieces[oppositeColor], piece => piece.square[0] === i + 1 && piece.square[1] === j);
          } else {
            this.board[i - 1][j].piece = undefined;
            _.remove(this.pieces[oppositeColor], piece => piece.square[0] === i - 1 && piece.square[1] === j);
          }
        }

        //Increment fullmoves and halfmoves counters if black is moving
        if (this.currentTurnColor === PIECE_COLOR.BLACK) {
          this.fullmoves++;
          this.halfmoves++;
        }

        //Reset halfmoves counter if pawn is moving or piece is being captured
        if (this.board[r][f].piece!.type === PIECE_TYPE.PAWN || this.board[i][j].piece) {
          this.halfmoves = 0;
        }

        //Update last move
        this.lastMove = {
          piece: this.board[r][f].piece!,
          from: [r, f],
          to: [i, j],
          isCapture: this.board[i][j].piece || isCapture ? true : false,
          isCheck,
          isCheckmate,
          promotionType,
          castlingSide,
          algebraicNotation: '',
          fen: '',
          sound
        } as Move;

        this.lastMove.algebraicNotation = Chessboard.moveToAlgebraic(this.lastMove, this.pieces[this.currentTurnColor]);

        //Update move history
        if (this.currentTurnColor === PIECE_COLOR.WHITE) {
          this.moves.push({
            [PIECE_COLOR.WHITE]: this.lastMove,
          } as Fullmove);
          this.currentMove.color = PIECE_COLOR.WHITE;
          this.currentMove.index++;
        } else {
          this.moves[this.fullmoves - 2][PIECE_COLOR.BLACK] = this.lastMove;
          this.currentMove.color = PIECE_COLOR.BLACK;
        }

        //Highlight last move
        this.board[r][f].highlight = true;
        this.board[i][j].highlight = true;

        //Perform a move
        const x = _.findIndex(this.pieces[this.currentTurnColor], piece => piece.square[0] === r && piece.square[1] === f);
        if (x >= 0) {
          this.pieces[this.currentTurnColor][x].square = [i, j];
          if (this.board[i][j].piece) {
            _.remove(this.pieces[oppositeColor], piece => piece.square[0] === i && piece.square[1] === j);
            if (sound === SOUND_TYPE.MOVE_SELF) {
              sound = SOUND_TYPE.CAPTURE;
            }
          } else {
            if (sound === SOUND_TYPE.MOVE_SELF) {
              sound = this.currentTurnColor === this.color ? SOUND_TYPE.MOVE_SELF : SOUND_TYPE.MOVE_OPPONENT;
            }         
          }
          this.board[i][j].piece = this.board[r][f].piece;
          this.board[r][f].piece = undefined;
        }

        //Check wheter move triggers promotion
        if (this.board[i][j].piece!.type === PIECE_TYPE.PAWN && ((this.board[i][j].piece!.color === PIECE_COLOR.WHITE && i === 0) || (this.board[i][j].piece!.color === PIECE_COLOR.BLACK && i === 7))) {
          const x = _.findIndex(this.pieces[this.currentTurnColor], piece => piece.square[0] === i && piece.square[1] === j);
          if (x >= 0) {
            this.pieces[this.currentTurnColor][x].type = this.promotionType;
            this.board[i][j].piece!.type = this.promotionType;
            if (this.currentTurnColor === PIECE_COLOR.WHITE) {
              this.moves[this.fullmoves - 1][this.currentTurnColor]!.promotionType = this.promotionType;
            } else {
              this.moves[this.fullmoves - 2][this.currentTurnColor]!.promotionType = this.promotionType;
            }
          }
        }

        //Update castling rights before switching turn
        if (this.castlingRights[this.currentTurnColor]) {
          this.castlingRights[this.currentTurnColor] = Chessboard.updateCastlingRights(this.board, this.currentTurnColor, this.castlingRights[this.currentTurnColor]);
        }

        //Switching turn for other color
        this.currentTurnColor = this.currentTurnColor === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;
        const opponentColor = this.currentTurnColor === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;

        //Compute all possible legal moves for next turn color
        this.pieces[this.currentTurnColor].forEach(piece => {
          piece.legalMoves = Chessboard.computeLegalMoves(this.board, piece.square, this.castlingRights[this.currentTurnColor], this.lastMove);
        })

        this.pieceMouseUp();

        const movesIndex = opponentColor === PIECE_COLOR.WHITE ? this.fullmoves - 1 : this.fullmoves - 2;

        //Detect if check occured
        if (Chessboard.detectCheck(this.board, this.currentTurnColor)) {
          this.moves[movesIndex][opponentColor]!.algebraicNotation += '+';
          sound = SOUND_TYPE.MOVE_CHECK;
        }

        //Update FEN
        this.fen = Chessboard.getFen(this.board, this.castlingRights, this.halfmoves, this.fullmoves, this.currentTurnColor, this.lastMove);
        this.moves[movesIndex][opponentColor]!.fen = this.fen;

        //Update PGN
        this.pgn = Chessboard.getPGN(this.moves);
        
        let moveslength = 0;
        for (const opening of eco) {
          if (this.pgn.split("\n\n")[1].startsWith(opening.moves)) {
            
            if (opening.moves.length > moveslength) {
              moveslength = opening.moves.length;
              this.eco = opening.eco + ': ' + opening.name;
            }
          }
        }

        this.moves[movesIndex][opponentColor]!.sound = sound;

        //Detect if checkmate/stalemate/50 move rule occured
        if (this.halfmoves >= 50 || !this.pieces[this.currentTurnColor].map(piece => piece.legalMoves).find(moves => moves.length)) {
          const opponentLegalMoves = this.pieces[opponentColor].map(piece => Chessboard.computeLegalMoves(this.board, piece.square, this.castlingRights[opponentColor], this.lastMove));
          
          if (this.halfmoves >= 50) {
            //50 move rule reached, draw
          } else if (!opponentLegalMoves.find(moves => moves.length)) {
            //Stalemate
          } else {
            //Checkmate
            const movesIndex = opponentColor === PIECE_COLOR.WHITE ? this.fullmoves - 1 : this.fullmoves - 2;
            let algebraicNotation = this.moves[movesIndex][opponentColor]!.algebraicNotation;
            this.moves[movesIndex][opponentColor]!.algebraicNotation = algebraicNotation.slice(0, -1) + '#';
          }

          effects[SOUND_TYPE.GAME_END].play();
        } else {
          effects[sound].play();
          this.stockfishRun();
        }
      } else {
        this.pieceMouseUp();
      }
    },
    showMove(index: number, color: PIECE_COLOR) {
      if (index >= 0 && index < this.moves.length && this.moves[index][color]) {
        this.currentMove.index = index;
        this.currentMove.color = color;
        this.loadPosition(this.moves[index][color]!.fen);
        effects[this.moves[index][color]!.sound].play();

        const [a, b] = this.moves[index][color]!.from;
        const [c, d] = this.moves[index][color]!.to;
        for (let r = 0; r < 8; r++) {
          for (let f = 0; f < 8; f++) {
            if ((a === r && b === f) || (c === r && d === f)) {
              this.board[r][f].highlight = true;
            } else {
              this.board[r][f].highlight = false;
            }
          }
        }
      }
    },
    loadPosition(fen: string) {
      const board = Chessboard.fenToBoard(fen);
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          this.board[i][j] = board[i][j];
        }
      }
    },
    async stockfishRun() {
      const engine = useEngineStore();

      await engine.run(ENGINE.STOCKFISH, this.fen);

      if ((this.currentTurnColor != this.color && this.stockfish) || this.alwaysStockfish) {
        const from = engine.response.bestmove.substring(0, 2);
        const to = engine.response.bestmove.substring(2, 4);

        const [r, f] = Chessboard.algebraicToBoard(from);
        const [i, j] = Chessboard.algebraicToBoard(to);

        if (engine.response.bestmove.length > 4) {
          this.promotionType = engine.response.bestmove[4] as PIECE_TYPE;
        }
        
        this.clearHighlights();

        this.pieceMove([r, f], [i, j]);
      }
    },
    setPromotionPiece(pieceType : PIECE_TYPE) {
      this.promotionType = pieceType;
      this.promotionModalVisible = false;
      this.pieceMove(this.promotionMove.from, this.promotionMove.to);
      this.promotionType = PIECE_TYPE.PAWN;
    },
    switchAlwaysStockfish() {
      this.alwaysStockfish = !this.alwaysStockfish;
      if (this.alwaysStockfish) {
        this.stockfishRun();
      }
    },
    switchStockfish() {
      this.stockfish = !this.stockfish;
      if (this.stockfish && this.currentTurnColor === PIECE_COLOR.BLACK) {
        this.stockfishRun();
      }
    },
    setArrowFrom(square: Square) {
      this.arrowFrom = [...square];
    },
    setArrowTo([i, j]: Square) {
      //TODO delete arrow if it already exist
      if (this.arrowFrom && (this.arrowFrom[0] !== i || this.arrowFrom[1] !== j)) {
        const { rotation, points } = Chessboard.getArrowCoordinates(this.arrowFrom, [i, j]);
        //Add an arrow
        this.arrows.push({
          color: 'orange',
          rotation,
          points
        });
      } else {
        this.setHighlightColor([i, j], 'red');
      }
    }
  },
});
