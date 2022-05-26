import Chessboard from "@/chessboard";
import { useEngineStore } from "@/stores/engine";
import { ENGINE, SOUND_TYPE, PIECE_TYPE, PIECE_COLOR, CASTLING_SIDE, GAME_RESULT, MOVE_MARK } from '@/enums';
import { defineStore } from "pinia";
import { Howl } from "howler";
import _ from "lodash";

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
    const { pieces, castlingRights, halfmoves, fullmoves, color } = chessboard;

    let board: Board = new Array(89).fill({});
    for (let i = 1; i <= 8; i++) {
      for (let j = 1; j <= 8; j++) {
        const squareData = {
          active: false,
          legalMove: false,
          highlight: false,
          highlightColor: ''
        };
        board[i * 10 + j] = squareData;
      }
    }

    return ({
      board,
      color,
      currentTurnColor: color,
      castlingRights,
      pieces,
      halfmoves,
      fullmoves,
      lastMove: {} as Move,
      moves: [] as Move[],
      movesAlgebraic: '',
      variations: [] as Variation[],
      result: GAME_RESULT.IN_PROGRESS,
      promotionType: PIECE_TYPE.PAWN,
      currentMoveIndex: -1,
      stockfish: false,
      alwaysStockfish: false,
      showFeedback: true,
      showVariations: true,
      showEvaluation: true,
      arrowFrom: -1,
      arrows: [] as Arrow[],
      fen,
      pgn: {
        value: '',
        tags: {
          event: '',
          site: '',
          date: '',
          round: '',
          white: '',
          black: '',
          result: ''
        }
      },
      openingData: {
        name: 'None',
          eco: '',
          fen: '',
          movesAlgebraic: ''
      } as OpeningData,
      promotionModalVisible: false,
      promotionMove: {
        from: -1,
        to: -1
      },
      dragging: -1,
      engineWorking: false
    });
  },
  getters: {
    oppositeColor: (state) => state.currentTurnColor === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE,
    movesLength: (state) => state.moves.length,
    movesReversed: (state) => state.moves.slice().reverse(),
    getPiece: (state) => {
      return (index: number) : Piece | undefined => state.pieces.find(piece => piece.square === index);
    }
  },
  actions: {
    newGame(fen: string) {
      const chessboard = Chessboard.create(fen);
      const { pieces, castlingRights } = chessboard;
      const color = PIECE_COLOR.WHITE;

      for (let i = 11; i < 89; i++) {
        this.board[i] = {
          active: false,
          legalMove: false,
          highlight: false,
          highlightColor: ''
        };
      }
      this.color = PIECE_COLOR.WHITE;
      this.castlingRights = castlingRights;
      this.currentTurnColor = color;
      this.pieces = pieces;
      this.lastMove = {} as Move; //TODO set last move to en passant target square if present
      this.halfmoves = 0;
      this.fullmoves = 1;
      this.moves = [] as Move[];
      this.promotionType = PIECE_TYPE.PAWN;
      this.promotionModalVisible = false;
      this.promotionMove = {
        from: -1,
        to: -1
      };
      this.fen = fen;
    },
    loadPGN(pgn: string) {
      this.result = GAME_RESULT.IN_PROGRESS;
      const rows = pgn.split("\n");

      for (const row of rows) {
        if (row.length >= 0 && row.startsWith('[')) {
          if (row.includes('Event ')) {
            this.pgn.tags.event = row.split('"')[1];
          }
          if (row.includes('Site ')) {
            this.pgn.tags.site = row.split('"')[1];
          }
          if (row.includes('Date ')) {
            this.pgn.tags.date = row.split('"')[1];
          }
          if (row.includes('Round ')) {
            this.pgn.tags.round = row.split('"')[1];
          }
          if (row.includes('White ')) {
            this.pgn.tags.white = row.split('"')[1];
          }
          if (row.includes('Black ')) {
            this.pgn.tags.black = row.split('"')[1];
          }
          if (row.includes('Result ')) {
            this.pgn.tags.result = row.split('"')[1];
          }
        }
      }
      
      const chessboard = Chessboard.create(pgn);
      const { pieces, castlingRights, halfmoves, fullmoves, color, moves } = chessboard;

      this.color = color;
      this.castlingRights = castlingRights;
      this.halfmoves = halfmoves;
      this.fullmoves = fullmoves;
      this.pieces = pieces;
      this.moves = moves;
      if (moves.length) {
        this.fen = moves[moves.length - 1].fen;
        this.stockfishRun();
      }
      this.movesAlgebraic = pgn.slice(this.pgn.value.lastIndexOf(']') + 1).trim();
      this.openingData = Chessboard.getOpeningData(this.movesAlgebraic);
      if (this.moves[this.moves.length - 1].isCheckmate) {
        this.result = this.moves[this.moves.length - 1].piece.color === PIECE_COLOR.WHITE ? GAME_RESULT.WHITE_WON : GAME_RESULT.BLACK_WON;
      }
      this.currentMoveIndex = this.moves.length - 1;
    },
    setHighlightColor(v: number, color: string) {
      if (!this.board[v].highlightColor || this.board[v].highlightColor !== color) {
        this.board[v].highlightColor = color;
      } else {
        this.board[v].highlightColor = '';
      }
    },
    pieceMouseDown(v: number) {
      if (this.result) {
        return;
      }
      
      for (let i = 1; i <= 8; i++) {
        for (let j = 1; j <= 8; j++) {
          this.board[i*10 + j].active = false;
          this.board[i*10 + j].legalMove = false;
        }
      }

      const piece = this.pieces.find(piece => piece.square === v && piece.color === this.currentTurnColor);
      if (piece && this.currentMoveIndex === this.movesLength - 1) {
        //Set coordinates of current dragged piece
        this.dragging = v;

        //Make square background in active yellow color
        this.board[v].active = true;

        //Display all legal moves for piece on chessboard
        for (const w of piece!.legalMoves) {
          this.board[w].legalMove = true;
        }
      }
    },
    pieceMouseUp() {
      //Set non-existing dragging coordinates
      this.dragging = -1;
    },
    clearHighlights() {
      for (let i = 11; i < 89; i++) {
        this.board[i].highlight = false;
        this.board[i].highlightColor = '';
      }
    },
    clearColoredHighlights() {
      for (let i = 11; i < 89; i++) {
        this.board[i].highlight = false;
        this.board[i].highlightColor = '';
      }
      this.arrows = [] as Arrow[];
    },
    pieceMoveFromActive(w: number) {
      const v = _.findIndex(this.board, square => square.active);
      if (v >= 11 && v !== w) {
        this.clearHighlights();

        const piece = Chessboard.p(this.pieces, v);

        const toRank = Chessboard.s2c(w)[0];

        if (this.promotionType === PIECE_TYPE.PAWN && piece && piece.type === PIECE_TYPE.PAWN && ((piece.color === PIECE_COLOR.WHITE && toRank === 1) || (piece.color === PIECE_COLOR.BLACK && toRank === 8))) {
          /**
           * Promotion move detected, instead of performing this move, first show
           * popover for user in order to select promotion piece
           */
          this.promotionMove.from = v;
          this.promotionMove.to = w;
          this.promotionModalVisible = true;
        } else {
          this.pieceMove(v, w);
        }
      }
    },
    pieceMove(v: number, w: number) {
      const [r, f] = Chessboard.s2c(v);
      const [i, j] = Chessboard.s2c(w);

      const piece = Chessboard.p(this.pieces, v);
      const occupyingPiece = Chessboard.p(this.pieces, w);

      if (piece && piece.color === this.currentTurnColor && piece.legalMoves.includes(w)) {
        for (let x = 11; x < 89; x++) {
          this.board[x].active = false;
          this.board[x].legalMove = false;
        }
        
        let sound = SOUND_TYPE.MOVE_SELF;

        //Move variables
        let castlingSide: boolean | CASTLING_SIDE = false;
        let isCapture = false;
        let promotionType: boolean | PIECE_TYPE = false;
        let isCheck = false;

        //Castling
        if (i === r && [1, 8].includes(r) && f === 5 && (Math.abs(f - j) === 2)) {
          //Only possible files for king are 7 and 3
          const rookFileFrom = j === 7 ? 8 : 1;
          const rookFileTo = j === 7 ? 6 : 4;

          //Move rook to castled square
          const rook = Chessboard.p(this.pieces, [i, rookFileFrom]);
          if (rook) {
            sound = SOUND_TYPE.CASTLE;
            castlingSide = rookFileFrom === 8 ? CASTLING_SIDE.KINGSIDE : CASTLING_SIDE.QUEENSIDE;
            
            Chessboard.makeMove(this.pieces, [i, rookFileFrom], [i, rookFileTo]);
          }
        }

        if (piece.type === PIECE_TYPE.PAWN && !occupyingPiece && j != f) {
          //En passant capture
          isCapture = true;
          if (this.currentTurnColor === this.color) {
            _.remove(this.pieces, piece => piece.square === Chessboard.c2s(i + 1, j));
          } else {
            _.remove(this.pieces, piece => piece.square === Chessboard.c2s(i - 1, j));
          }
        }

        //Increment fullmoves and halfmoves counters if black is moving
        if (this.currentTurnColor === PIECE_COLOR.BLACK) {
          this.fullmoves++;
          this.halfmoves++;
        }

        //Reset halfmoves counter if pawn is moving or piece is being captured
        if (piece.type === PIECE_TYPE.PAWN || occupyingPiece) {
          this.halfmoves = 0;
        }

        //Update last move
        let move = {
          piece,
          from: v,
          to: w,
          isCapture: occupyingPiece !== undefined || isCapture ? true : false,
          isCheck,
          isCheckmate: false,
          promotionType,
          castlingSide,
          algebraicNotation: '',
          fen: '',
          sound
        } as Move;

        //Highlight last move
        this.board[v].highlight = true;
        this.board[w].highlight = true;

        //Set proper sound type
        if (sound === SOUND_TYPE.MOVE_SELF) {
          if (occupyingPiece) {
            sound = SOUND_TYPE.CAPTURE;
          } else {
            sound = this.currentTurnColor === this.color ? SOUND_TYPE.MOVE_SELF : SOUND_TYPE.MOVE_OPPONENT;
          } 
        }

        //Perform a move with computing legal moves
        Chessboard.makeMove(this.pieces, v, w, this.castlingRights[this.currentTurnColor]);

        //Get reference to moved piece
        const movedPiece = Chessboard.p(this.pieces, w)!;

        //Check wheter move triggers promotion
        if (movedPiece.type === PIECE_TYPE.PAWN && [1, 8].includes(movedPiece.rank)) {
          this.pieces[this.pieces.indexOf(movedPiece)].type = this.promotionType;
          move.promotionType = this.promotionType;
        }

        //Update castling rights before switching turn
        if (this.castlingRights[this.currentTurnColor]) {
          this.castlingRights[this.currentTurnColor] = Chessboard.updateCastlingRights(this.pieces, this.currentTurnColor, this.castlingRights[this.currentTurnColor]);
        }

        //Switching turn for other color
        this.currentTurnColor = this.currentTurnColor === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;        

        this.pieceMouseUp();

        //Detect if check occured
        if (Chessboard.detectCheck(this.pieces, this.currentTurnColor)) {
          move.isCheck = true;
          effects[SOUND_TYPE.MOVE_CHECK].play();
        }

        //Update FEN
        this.fen = Chessboard.getFen(this.pieces, this.castlingRights, this.halfmoves, this.fullmoves, this.currentTurnColor, move);
        move.fen = this.fen;

        //Update PGN
        this.pgn.value = Chessboard.getPGN(this.moves);

        //Update algebraic move list
        this.movesAlgebraic = this.pgn.value.slice(this.pgn.value.lastIndexOf(']') + 1).trim();
        
        //Update opening data
        this.openingData = Chessboard.getOpeningData(this.movesAlgebraic);

        move.sound = sound;

        const hasOpponentLegalMoves = this.pieces.find(piece => piece.color === this.currentTurnColor && piece.legalMoves.length) !== undefined;
        const hasLegalMoves = this.pieces.find(piece => piece.color === this.oppositeColor && piece.legalMoves.length) !== undefined;
        move.isCheckmate = !hasOpponentLegalMoves && hasLegalMoves;
        const isStalemate = !hasOpponentLegalMoves && !hasLegalMoves;

        move.algebraicNotation = Chessboard.moveToAlgebraic(move, this.pieces);

        //Update move history
        this.moves.push(move);

        //Update last move
        this.lastMove = move;

        //Update currently displayed move from history
        this.currentMoveIndex++;

        //Detect if checkmate/stalemate/50 move rule occured
        if (this.halfmoves >= 50 || move.isCheckmate || isStalemate) {
          if (this.halfmoves >= 50) {
            //50 move rule reached, draw
            this.result = GAME_RESULT.DRAW;
          } else if (isStalemate) {
            //Stalemate
            this.result = GAME_RESULT.DRAW;
          } else {
            //Checkmate
            this.result = this.oppositeColor === PIECE_COLOR.WHITE ? GAME_RESULT.WHITE_WON : GAME_RESULT.BLACK_WON;
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
    showMove(index: number) {
      if (index >= 0 && index < this.moves.length) {
        this.currentMoveIndex = index;
        this.loadPosition(this.moves[index].fen);
        this.stockfishRun(this.moves[index].fen);
        effects[this.moves[index].sound].play();

        const v = this.moves[index].from;
        const w = this.moves[index].to;
        
        for (let i = 11; i < 89; i++) {
          this.board[i].highlight = (i === v || i === w);
        }
      }
    },
    loadPosition(fen: string) {
      const { pieces } = Chessboard.create(fen);
      this.pieces = [ ...pieces ];
    },
    stockfishRun(fen?: string) {
      const engine = useEngineStore();
      this.engineWorking = true;
      engine.run(ENGINE.STOCKFISH, fen ?? this.fen);
    },
    stockfishDone() {
      this.engineWorking = false;
      const engine = useEngineStore();

      //Update variations
      for (let i = 0; i < engine.response.variations.length; i++) {
        const { pv, score, mate } = engine.response.variations[i];

        const evaluation = mate ? score : (score / 100); 

        this.variations[i] = {
          moves: Chessboard.getVariationData(this.pieces, pv, this.castlingRights[PIECE_COLOR.WHITE], this.castlingRights[PIECE_COLOR.BLACK]),
          eval: this.moves[this.currentMoveIndex].piece.color === PIECE_COLOR.WHITE ? evaluation * (-1) : evaluation,
          mate
        };

        if (this.moves.length > 0 && !i) {
          const bestMove = {
            move: this.variations[i].moves[0],
            eval: this.variations[i].eval,
            mate
          };

          //Update best next move
          this.moves[this.currentMoveIndex].bestNextMove = bestMove;

          //Update move mark
          if (this.openingData.movesAlgebraic.includes(this.movesAlgebraic)) {
            this.moves[this.currentMoveIndex].mark = MOVE_MARK.BOOK;
          } else if (this.moves.length > 1 && this.moves[this.currentMoveIndex - 1].bestNextMove) {
            const previousMove = this.moves[this.currentMoveIndex - 1].bestNextMove!;
            const evalDifference = Math.abs(this.variations[i].eval - previousMove.eval);

            console.log(`this.variations[i].eval: ${this.variations[i].eval}`);
            console.log(`this.moves[this.moves.length - 2].bestNextMove!.eval: ${this.moves[this.currentMoveIndex - 1].bestNextMove!.eval}`);

            if (previousMove.move.from == this.moves[this.currentMoveIndex].from && previousMove.move.to == this.moves[this.currentMoveIndex].to) {
              this.moves[this.currentMoveIndex].mark = MOVE_MARK.BEST_MOVE;
            } else if (evalDifference < 0.7) {
              this.moves[this.currentMoveIndex].mark = MOVE_MARK.EXCELLENT;
            } else if (evalDifference < 1) {
              this.moves[this.currentMoveIndex].mark = MOVE_MARK.GOOD;
            } else if (evalDifference < 1.5) {
              this.moves[this.currentMoveIndex].mark = MOVE_MARK.INACCURACY;
            } else if (evalDifference < 2) {
              this.moves[this.currentMoveIndex].mark = MOVE_MARK.MISTAKE;
            } else {
              this.moves[this.currentMoveIndex].mark = MOVE_MARK.BLUNDER;
            }
          }
        }
      }

      if ((this.currentTurnColor != this.color && this.stockfish) || this.alwaysStockfish) {
        const from = engine.response.bestmove.substring(0, 2);
        const to = engine.response.bestmove.substring(2, 4);

        const v = Chessboard.a2s(from);
        const w = Chessboard.a2s(to);

        if (engine.response.bestmove.length > 4) {
          this.promotionType = engine.response.bestmove[4] as PIECE_TYPE;
        }
        
        this.clearHighlights();

        this.pieceMove(v, w);
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
    setArrowFrom(v: number) {
      this.arrowFrom = v;
    },
    setArrowTo(w: number, color: string) {
      if (this.arrowFrom && this.arrowFrom !== w) {
        const arrow = this.arrows.find(arrow => arrow.from === this.arrowFrom && arrow.to === w);
        if (arrow) {
          //Remove an arrow, because it exist
          this.arrows = this.arrows.filter(arrow => arrow.from !== this.arrowFrom || arrow.to !== w);
        }
        if (!arrow || arrow.color !== color) {
          const { transform, points } = Chessboard.getArrowCoordinates(this.arrowFrom, w);
          //Add an arrow
          this.arrows.push({
            color,
            from: this.arrowFrom,
            to: w,
            transform,
            points
          });
        }
      } else {
        this.setHighlightColor(w, color);
      }
    },
    async generateReport() {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve('ok');
        }, 5000);
      });
    }
  },
});
