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
      variations: [] as Move[][],
      promotionType: PIECE_TYPE.PAWN,
      currentMoveIndex: -1,
      stockfish: false,
      alwaysStockfish: false,
      arrowFrom: -1,
      arrows: [] as Arrow[],
      fen,
      pgn: '',
      eco: '',
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
      this.pieces.forEach(piece => {
        piece.legalMoves = Chessboard.computeLegalMoves(pieces, piece.square, this.castlingRights[PIECE_COLOR.WHITE], this.lastMove);
      })
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
      //TODO load game from PGN
    },
    setHighlightColor(v: number, color: string) {
      if (!this.board[v].highlightColor || this.board[v].highlightColor !== color) {
        this.board[v].highlightColor = color;
      } else {
        this.board[v].highlightColor = '';
      }
    },
    pieceMouseDown(v: number) {
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
        let isCheckmate = false;

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
          isCheckmate,
          promotionType,
          castlingSide,
          algebraicNotation: '',
          fen: '',
          sound
        } as Move;

        move.algebraicNotation = Chessboard.moveToAlgebraic(move, this.pieces);

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

        //Perform a move
        Chessboard.makeMove(this.pieces, v, w);

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

        //Compute all possible legal moves for the next turn
        this.pieces.forEach(piece => {
          piece.legalMoves = Chessboard.computeLegalMoves(this.pieces, piece.square, this.castlingRights[this.currentTurnColor], move);
        })

        this.pieceMouseUp();

        //Detect if check occured
        if (Chessboard.detectCheck(this.pieces, this.currentTurnColor)) {
          move.algebraicNotation += '+';
          sound = SOUND_TYPE.MOVE_CHECK;
        }

        //Update FEN
        this.fen = Chessboard.getFen(this.pieces, this.castlingRights, this.halfmoves, this.fullmoves, this.currentTurnColor, move);
        move.fen = this.fen;

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

        move.sound = sound;

        //Update move history
        this.moves.push(move);

        //Update last move
        this.lastMove = move;

        //Update currently displayed move from history
        this.currentMoveIndex++;

        //Detect if checkmate/stalemate/50 move rule occured
        if (this.halfmoves >= 50 || !this.pieces.find(piece => piece.color === this.currentTurnColor && piece.legalMoves.length)) {
          if (this.halfmoves >= 50) {
            //50 move rule reached, draw
          } else if (!!this.pieces.find(piece => piece.color === this.oppositeColor && piece.legalMoves.length)) {
            //Stalemate
          } else {
            //Checkmate
            let algebraicNotation = this.moves[this.moves.length - 1].algebraicNotation;
            this.moves[this.moves.length - 1].algebraicNotation = algebraicNotation.slice(0, -1) + '#';
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
        effects[this.moves[index].sound].play();

        const v = this.moves[index].from;
        const w = this.moves[index].to;
        
        for (let i = 11; i < 89; i++) {
          this.board[i].highlight = (i === v || i === w);
        }
      }
    },
    loadPosition(fen: string) {
      const { pieces } = Chessboard.create(fen, this.lastMove);
      this.pieces = [ ...pieces ];
    },
    stockfishRun() {
      const engine = useEngineStore();
      this.engineWorking = true;
      engine.run(ENGINE.STOCKFISH, this.fen);
    },
    stockfishDone() {
      this.engineWorking = false;
      const engine = useEngineStore();

      for (let i = 0; i < engine.response.variations.length; i++) {
        this.variations[i] = Chessboard.getVariationData(this.pieces, engine.response.variations[i]);
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
    }
  },
});
