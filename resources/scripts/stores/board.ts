import { Chessboard, PIECE_COLOR, PIECE_TYPE, CASTLING_SIDE } from "@/chessboard";
import { defineStore } from "pinia";
import { Howl } from "howler";
import _ from "lodash";
import axios from "axios";

//'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
//'r3k2r/p1p2ppp/2p1bn2/2Q5/5Bq1/2N5/PPP1NPPP/R3K2R b KQkq - 0 14'

export const useBoardStore = defineStore({
  id: "board",
  state: () => {
    const chessboard = Chessboard.create('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const { board, castlingRights, halfmoves, fullmoves, color } = chessboard;
    let whitePieces = Chessboard.getPieces(board, PIECE_COLOR.WHITE);
    let blackPieces = Chessboard.getPieces(board, PIECE_COLOR.BLACK);
    let pieces = {
      [PIECE_COLOR.WHITE]: whitePieces,
      [PIECE_COLOR.BLACK]: blackPieces,
    };
    const lastMove = {} as Move;

    const legalMoves = pieces[color].map(piece => Chessboard.computeLegalMoves(board, piece.square, castlingRights[PIECE_COLOR.WHITE], lastMove));

    return ({
      board,
      color,
      currentTurnColor: color,
      castlingRights,
      pieces,
      legalMoves,
      halfmoves,
      fullmoves,
      lastMove,
      move: {
        [PIECE_COLOR.WHITE]: {} as Move,
        [PIECE_COLOR.BLACK]: {} as Move,
      } as Fullmove,
      moves: [] as Fullmove[],
      promotionType: PIECE_TYPE.PAWN,
      stockfish: false,
      promotionModalVisible: false,
      promotionMove: {
        from: [0, 0] as Square,
        to: [0, 0] as Square
      }
    });
  },
  actions: {
    newGame(isPlayingWhite: boolean) {
      const { board, color } = Chessboard.create('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      this.color = isPlayingWhite ? PIECE_COLOR.WHITE : PIECE_COLOR.BLACK;
      this.board = board;
      this.currentTurnColor = color;
      this.pieces = {
        [PIECE_COLOR.WHITE]: Chessboard.getPieces(board, PIECE_COLOR.WHITE),
        [PIECE_COLOR.BLACK]: Chessboard.getPieces(board, PIECE_COLOR.BLACK),
      }
    },
    pieceMouseDown([i, j]: Square) {
      if (this.board[i][j].piece && this.board[i][j].piece!.color == this.currentTurnColor) {
        this.board[i][j].active = true;
        const x = _.findIndex(this.pieces[this.currentTurnColor], piece => piece.square[0] === i && piece.square[1] === j);
        if (x >= 0) {
          for (const [a, b] of this.legalMoves[x]) {
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
        }
      }
    },
    clearHighlights() {
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          this.board[i][j].highlight = false;
        }
      }
    },
    stockfishMove(move: string) {
      const from = move.substring(0, 2);
      const to = move.substring(2, 4);

      const [r, f] = Chessboard.algebraicToBoard(from);
      const [i, j] = Chessboard.algebraicToBoard(to);

      if (move.length > 4) {
        this.promotionType = move[4] as PIECE_TYPE;
      }
      
      this.clearHighlights();

      this.pieceMove([r, f], [i, j]);
    },
    pieceMoveFromActive(toSquare: Square) {
      const fromSquare = Chessboard.getActiveSquare(this.board);
      if (fromSquare) {
        this.clearHighlights();

        const [r, f] = fromSquare;
        const [i, j] = toSquare;

        if (this.promotionType === PIECE_TYPE.PAWN && this.board[r][f].piece!.type === PIECE_TYPE.PAWN && ((this.board[r][f].piece!.color === PIECE_COLOR.WHITE && i === 0) || (this.board[r][f].piece!.color === PIECE_COLOR.BLACK && i === 7))) {
          console.log('promotion detected, showing modal...')
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
      const squareIndex = _.findIndex(this.pieces[this.currentTurnColor], piece => piece.square[0] === r && piece.square[1] === f);
      if (squareIndex >= 0 && this.legalMoves[squareIndex].find(s => s[0] === i && s[1] === j)) {
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
            sound = this.currentTurnColor === PIECE_COLOR.WHITE ? 'castle1.mp3' : 'castle2.mp3';
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
          castlingSide
        } as Move;

        //Update move history
        if (this.currentTurnColor === PIECE_COLOR.WHITE) {
          this.moves.push({
            [PIECE_COLOR.WHITE]: this.lastMove,
          } as Fullmove);
        }
        if (this.currentTurnColor === PIECE_COLOR.BLACK) {
          this.moves[this.fullmoves - 2][PIECE_COLOR.BLACK] = this.lastMove;
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
              sound = this.currentTurnColor === PIECE_COLOR.WHITE ? 'capture1.mp3' : 'capture2.mp3';
            }
          } else {
            if (!sound) {
              sound = this.currentTurnColor === PIECE_COLOR.WHITE ? 'move1.mp3' : 'move2.mp3';
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
        this.legalMoves = this.pieces[this.currentTurnColor].map(piece => Chessboard.computeLegalMoves(this.board, piece.square, this.castlingRights[this.currentTurnColor], this.lastMove));

        this.pieceMouseUp();

        let isThreefoldRepetition = false;
        if (this.moves.length > 6 || (this.moves.length == 6 && this.moves[this.moves.length - 1][PIECE_COLOR.BLACK])) {
          const m = this.moves.length;
          const b = this.currentTurnColor === PIECE_COLOR.BLACK ? m - 1 : m;
          if (
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
          }
        }


        //Detect if check occured
        if (Chessboard.detectCheck(this.board, this.currentTurnColor)) {
          if (opponentColor === PIECE_COLOR.WHITE) {
            this.moves[this.fullmoves - 1][opponentColor]!.isCheck = true;
          } else {
            this.moves[this.fullmoves - 2][opponentColor]!.isCheck = true;
          }
          sound = this.currentTurnColor === PIECE_COLOR.WHITE ? 'check1.mp3' : 'check2.mp3';
        }

        //Detect if checkmate/stalemate/50 move rule occured
        if (this.halfmoves >= 50 || !this.legalMoves.find(moves => moves.length)) {
          const opponentLegalMoves = this.pieces[opponentColor].map(piece => Chessboard.computeLegalMoves(this.board, piece.square, this.castlingRights[opponentColor], this.lastMove));
          if (this.halfmoves >= 50) {
            console.log('50 move rule reached, draw');
            new Howl({
              src: ['sounds/endgame.mp3']
            }).play();
          } else if (!opponentLegalMoves.find(moves => moves.length)) {
            console.log('Stalemate');
            new Howl({
              src: ['sounds/stalemate.mp3']
            }).play();
          } else {
            if (opponentColor === PIECE_COLOR.WHITE) {
              this.moves[this.fullmoves - 1][opponentColor]!.isCheckmate = true;
            } else {
              this.moves[this.fullmoves - 2][opponentColor]!.isCheckmate = true;
            }
            new Howl({
              src: ['sounds/checkmate.mp3']
            }).play();
          }
        } else if (isThreefoldRepetition) { //Detect threefold repetition draw
          console.log('Threefold repetition, draw');
          new Howl({
            src: ['sounds/endgame.mp3']
          }).play();
        } else {
          new Howl({
            src: ['sounds/' + sound]
          }).play();
          if (this.currentTurnColor != this.color || true) {
            const fen = Chessboard.getFen(this.board, this.castlingRights, this.halfmoves, this.fullmoves, this.currentTurnColor, this.lastMove);
            console.log(`FEN: ${fen}`);
            axios('/api/bestmove/' + fen)
            .then(response => this.stockfishMove(response.data.bestmove));
          }
        }
      } else {
        this.pieceMouseUp();
      }
    },
    setPromotionPiece(pieceType : PIECE_TYPE) {
      this.promotionType = pieceType;
      this.promotionModalVisible = false;
      this.pieceMove(this.promotionMove.from, this.promotionMove.to);
      this.promotionType = PIECE_TYPE.PAWN;
    }
  },
});
