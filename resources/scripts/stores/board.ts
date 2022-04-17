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
    let pieces: Pieces = {
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
      moves: [] as Move[],
      variations: [] as Move[][],
      promotionType: PIECE_TYPE.PAWN,
      currentMoveIndex: -1,
      stockfish: false,
      alwaysStockfish: false,
      arrowFrom: null as Square | null,
      arrows: [] as Arrow[],
      fen,
      pgn: '',
      eco: '',
      promotionModalVisible: false,
      promotionMove: {
        from: [0, 0] as Square,
        to: [0, 0] as Square
      },
      dragging: -1,
      engineWorking: false
    });
  },
  getters: {
    oppositeColor: (state) => state.currentTurnColor === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE,
    movesLength: (state) => state.moves.length,
    movesReversed: (state) => state.moves.slice().reverse()
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
      this.moves = [] as Move[];
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
      if (!this.board[i][j].highlightColor || this.board[i][j].highlightColor !== color) {
        this.board[i][j].highlightColor = color;
      } else {
        this.board[i][j].highlightColor = '';
      }
    },
    pieceMouseDown([i, j]: Square) {
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          this.board[i][j].active = false;
          this.board[i][j].legalMove = false;
        }
      }

      if (
        this.currentMoveIndex < 0 || this.currentMoveIndex === this.moves.length - 1 &&
        (this.moves[this.moves.length - 1].piece.color !== this.currentTurnColor || !this.moves.length) &&
        this.board[i][j].piece && 
        this.board[i][j].piece!.color == this.currentTurnColor
      ) {
        //Set coordinates of current dragged piece
        this.dragging = i * 10 + j;

        //Make square background in active yellow color
        this.board[i][j].active = true;

        const piece = this.pieces[this.currentTurnColor].find(piece => piece.square[0] === i && piece.square[1] === j);
        if (piece) {
          //Display all legal moves for piece on chessboard
          for (const [a, b] of piece.legalMoves) {
            this.board[a][b].legalMove = true;
          }
        }
      }
    },
    pieceMouseUp() {
      //Set non-existing dragging coordinates
      this.dragging = -1;
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
      if (fromSquare && (fromSquare[0] != toSquare[0] || fromSquare[1] != toSquare[1])) {
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
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            this.board[i][j].active = false;
            this.board[i][j].legalMove = false;
          }
        }
        
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
        let move = {
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

        move.algebraicNotation = Chessboard.moveToAlgebraic(move, this.pieces[this.currentTurnColor], true);

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

            move.promotionType = this.promotionType;
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
          piece.legalMoves = Chessboard.computeLegalMoves(this.board, piece.square, this.castlingRights[this.currentTurnColor], move);
        })

        this.pieceMouseUp();

        //Detect if check occured
        if (Chessboard.detectCheck(this.board, this.currentTurnColor)) {
          move.algebraicNotation += '+';
          sound = SOUND_TYPE.MOVE_CHECK;
        }

        //Update FEN
        this.fen = Chessboard.getFen(this.board, this.castlingRights, this.halfmoves, this.fullmoves, this.currentTurnColor, move);
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
        if (this.halfmoves >= 50 || !this.pieces[this.currentTurnColor].map(piece => piece.legalMoves).find(moves => moves.length)) {
          const opponentLegalMoves = this.pieces[opponentColor].map(piece => Chessboard.computeLegalMoves(this.board, piece.square, this.castlingRights[opponentColor], move));
          
          if (this.halfmoves >= 50) {
            //50 move rule reached, draw
          } else if (!opponentLegalMoves.find(moves => moves.length)) {
            //Stalemate
          } else {
            //Checkmate
            //let algebraicNotation = this.moves[this.moves.length - 1].algebraicNotation;
            //this.moves[this.moves.length - 1].algebraicNotation = algebraicNotation.slice(0, -1) + '#';
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
        console.log(this.moves[index].fen);
        this.loadPosition(this.moves[index].fen);
        effects[this.moves[index].sound].play();

        const [a, b] = this.moves[index].from;
        const [c, d] = this.moves[index].to;
        
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
    setArrowTo([i, j]: Square, color: string) {
      if (this.arrowFrom && (this.arrowFrom[0] !== i || this.arrowFrom[1] !== j)) {
        const arrow = this.arrows.find(arrow => arrow.from[0] == this.arrowFrom![0] && arrow.from[1] == this.arrowFrom![1] && arrow.to[0] == i && arrow.to[1] == j);
        if (arrow) {
          //Remove an arrow, because it exist
          this.arrows = this.arrows.filter(arrow => arrow.from[0] != this.arrowFrom![0] || arrow.from[1] != this.arrowFrom![1] || arrow.to[0] != i || arrow.to[1] != j);
        }
        if (!arrow || arrow.color !== color) {
          const { transform, points } = Chessboard.getArrowCoordinates(this.arrowFrom, [i, j]);
          //Add an arrow
          this.arrows.push({
            color,
            from: this.arrowFrom,
            to: [i, j],
            transform,
            points
          });
        }
      } else {
        this.setHighlightColor([i, j], color);
      }
    }
  },
});
