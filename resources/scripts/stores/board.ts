import { Chessboard, PIECE_COLOR, PIECE_TYPE, CASTLING_SIDE } from "@/chessboard";
import { defineStore } from "pinia";
import { Howl } from "howler";
import _ from "lodash";
import axios from "axios";
import eco from "../eco.json";
/* import Echo from "laravel-echo";
import Pusher from "pusher-js";

let laravelEcho = new Echo({
    broadcaster: 'pusher',
    key: "app-key",
    wsHost: "127.0.0.1",
    wsPort: 6001,
    forceTLS: false,
    encrypted: true,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
});

laravelEcho.channel('bestmove')
.listen('message', (e) => {
    console.log(e);
}); */

let effects = {
  move1: new Howl({
    src: ['sounds/move1.mp3'],
    preload: true
  }),
  move2: new Howl({
    src: ['sounds/move2.mp3'],
    preload: true
  }),
  capture1: new Howl({
    src: ['sounds/capture1.mp3'],
    preload: true
  }),
  capture2: new Howl({
    src: ['sounds/capture2.mp3'],
    preload: true
  }),
  castle1: new Howl({
    src: ['sounds/castle1.mp3'],
    preload: true
  }),
  castle2: new Howl({
    src: ['sounds/castle1.mp3'],
    preload: true
  }),
  check1: new Howl({
    src: ['sounds/check1.mp3'],
    preload: true
  }),
  check2: new Howl({
    src: ['sounds/check2.mp3'],
    preload: true
  }),
  checkmate: new Howl({
    src: ['sounds/checkmate.mp3'],
    preload: true
  }),
  stalemate: new Howl({
    src: ['sounds/stalemate.mp3'],
    preload: true
  }),
  endgame: new Howl({
    src: ['sounds/endgame.mp3'],
    preload: true
  }),
};

//'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
//'r3k2r/p1p2ppp/2p1bn2/2Q5/5Bq1/2N5/PPP1NPPP/R3K2R b KQkq - 0 14'

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
      stockfishElo: 300, //from 100 to 3000
      stockfishDesiredDepth: 15, //from 1 to 35
      stockfishWorking: false,
      stockfishDepth: 0,
      stockfishMateIn: 0,
      fen,
      pgn: '',
      eco: '',
      eval: 0.0,
      promotionModalVisible: false,
      promotionMove: {
        from: [0, 0] as Square,
        to: [0, 0] as Square
      }
    });
  },
  getters: {
    evalPercent: (state) => {
      let percent = 50;
      let evalMultiplied = state.eval * 3;
      if (evalMultiplied < -50) {
        evalMultiplied = -50;
      }
      if (evalMultiplied > 50) {
        evalMultiplied = 50;
      }
      percent -= Math.round(evalMultiplied);
      return percent;
    },
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
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          this.board[i][j].dragged = false;
          this.board[i][j].active = false;
          this.board[i][j].legalMove = false;
          this.board[i][j].draggedOver = false;
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
    },
    stockfishMove(data: any) {
      const bestmove = data.bestmove as string;
      const depth = data.depth as number;

      this.stockfishWorking = false;
      this.stockfishDepth = depth;
      
      if (data.eval !== null) {
        this.eval = data.eval as number;
      }

      if (data.mate) {
        this.stockfishMateIn = data.mate as number;
      } else {
        this.stockfishMateIn = 0;
      }

      if ((this.currentTurnColor != this.color && this.stockfish) || this.alwaysStockfish) {
        const from = bestmove.substring(0, 2);
        const to = bestmove.substring(2, 4);

        const [r, f] = Chessboard.algebraicToBoard(from);
        const [i, j] = Chessboard.algebraicToBoard(to);

        if (bestmove.length > 4) {
          this.promotionType = bestmove[4] as PIECE_TYPE;
        }
        
        this.clearHighlights();

        this.pieceMove([r, f], [i, j]);
      }
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
        let sound = '';
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
            sound = this.currentTurnColor === PIECE_COLOR.WHITE ? 'castle1' : 'castle2';
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
            if (!sound) {
              sound = this.currentTurnColor === PIECE_COLOR.WHITE ? 'capture1' : 'capture2';
            }
          } else {
            if (!sound) {
              sound = this.currentTurnColor === PIECE_COLOR.WHITE ? 'move1' : 'move2';
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

        let isThreefoldRepetition = false;
        if (this.moves.length > 6 || (this.moves.length == 6 && this.moves[this.moves.length - 1][PIECE_COLOR.BLACK])) {
          const m = this.moves.length;
          const b = this.currentTurnColor === PIECE_COLOR.BLACK ? m - 1 : m;
          /* if (
              Chessboard.moveToAlgebraic(this.moves[m-1][opponentColor]!) === Chessboard.moveToAlgebraic(this.moves[m-3][opponentColor]!) &&
              Chessboard.moveToAlgebraic(this.moves[m-3][opponentColor]!) === Chessboard.moveToAlgebraic(this.moves[m-5][opponentColor]!) &&
              Chessboard.moveToAlgebraic(this.moves[m-2][opponentColor]!) === Chessboard.moveToAlgebraic(this.moves[m-4][opponentColor]!) &&
              Chessboard.moveToAlgebraic(this.moves[m-4][opponentColor]!) === Chessboard.moveToAlgebraic(this.moves[m-6][opponentColor]!) &&
              Chessboard.moveToAlgebraic(this.moves[b-1][this.currentTurnColor]!) === Chessboard.moveToAlgebraic(this.moves[b-3][this.currentTurnColor]!) &&
              Chessboard.moveToAlgebraic(this.moves[b-3][this.currentTurnColor]!) === Chessboard.moveToAlgebraic(this.moves[b-5][this.currentTurnColor]!) &&
              Chessboard.moveToAlgebraic(this.moves[b-2][this.currentTurnColor]!) === Chessboard.moveToAlgebraic(this.moves[b-4][this.currentTurnColor]!) &&
              Chessboard.moveToAlgebraic(this.moves[b-4][this.currentTurnColor]!) === Chessboard.moveToAlgebraic(this.moves[b-6][this.currentTurnColor]!)
            ) {
              isThreefoldRepetition = true;
          } */
        }

        const movesIndex = opponentColor === PIECE_COLOR.WHITE ? this.fullmoves - 1 : this.fullmoves - 2;

        //Detect if check occured
        if (Chessboard.detectCheck(this.board, this.currentTurnColor)) {
          this.moves[movesIndex][opponentColor]!.algebraicNotation += '+';
          sound = this.currentTurnColor === PIECE_COLOR.WHITE ? 'check1' : 'check2';
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

        //Detect if checkmate/stalemate/50 move rule occured
        if (this.halfmoves >= 50 || !this.pieces[this.currentTurnColor].map(piece => piece.legalMoves).find(moves => moves.length)) {
          const opponentLegalMoves = this.pieces[opponentColor].map(piece => Chessboard.computeLegalMoves(this.board, piece.square, this.castlingRights[opponentColor], this.lastMove));
          if (this.halfmoves >= 50) {
            console.log('50 move rule reached, draw');
            new Howl({
              src: ['sounds/endgame.mp3']
            }).play();
          } else if (!opponentLegalMoves.find(moves => moves.length)) {
            console.log('Stalemate');
            effects.stalemate.play();
          } else {
            const movesIndex = opponentColor === PIECE_COLOR.WHITE ? this.fullmoves - 1 : this.fullmoves - 2;
            let algebraicNotation = this.moves[movesIndex][opponentColor]!.algebraicNotation;
            this.moves[movesIndex][opponentColor]!.algebraicNotation = algebraicNotation.slice(0, -1) + '#';
            effects.checkmate.play();
          }
        } else if (isThreefoldRepetition) { //Detect threefold repetition draw
          console.log('Threefold repetition, draw');
          effects.endgame.play();
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
    stockfishRun() {
      this.stockfishWorking = true;
      //consider using built-in fetch api instead of axios
      axios(`/api/bestmove/${this.stockfishDesiredDepth}/${this.stockfishElo}/${this.fen}`)
      .then(response => this.stockfishMove(response.data))
      .catch(error => {
        console.log(error);
      });
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
    setStockfishElo(elo: any) {
      this.stockfishElo = elo as number;
    },
    setStockfishDesiredDepth(desiredDepth: any) {
      this.stockfishDesiredDepth = desiredDepth as number;
    },
    setDraggedOver([r, f]: Square) {
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          this.board[i][j].draggedOver = false;
        }
      }
      this.board[r][f].draggedOver = true;
    }
  },
});
