import { CASTLING_SIDE, Chessboard, PIECE_COLOR, PIECE_TYPE } from '@/chessboard';
import { defineStore } from "pinia";
import _ from 'lodash';
import axios from 'axios';

//'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
//'r3k2r/p1p2ppp/2p1bn2/2Q5/5Bq1/2N5/PPP1NPPP/R3K2R b KQkq - 0 14'

export const useBoardStore = defineStore({
  id: "board",
  state: () => {
    const { board } = Chessboard.create('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', true);
    const whitePieces = Chessboard.getPieces(board, PIECE_COLOR.WHITE);
    const blackPieces = Chessboard.getPieces(board, PIECE_COLOR.BLACK);
    const castlingRights = {
      [PIECE_COLOR.WHITE]: [CASTLING_SIDE.KINGSIDE, CASTLING_SIDE.QUEENSIDE],
      [PIECE_COLOR.BLACK]: [CASTLING_SIDE.KINGSIDE, CASTLING_SIDE.QUEENSIDE],
    };
    const lastMove = {
      piece: null,
      from: [0, 0],
      to: [0, 0],
    };

    const legalMoves = whitePieces.map(piece => Chessboard.computeLegalMoves(board, piece.square, castlingRights, lastMove));

    return ({
      board,
      color: PIECE_COLOR.WHITE,
      currentTurnColor: PIECE_COLOR.WHITE,
      inCheck: false as any,
      castlingRights,
      pieces: {
        [PIECE_COLOR.WHITE]: whitePieces,
        [PIECE_COLOR.BLACK]: blackPieces,
      },
      legalMoves,
      halfmoves: 0,
      fullmoves: 0,
      lastMove,
    });
  },
  actions: {
    newGame(isPlayingWhite: boolean) {
      const { board, activeColor } = Chessboard.create('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', isPlayingWhite);
      this.color = isPlayingWhite ? PIECE_COLOR.WHITE : PIECE_COLOR.BLACK;
      this.board = board;
      this.currentTurnColor = activeColor;
      this.pieces = {
        [PIECE_COLOR.WHITE]: Chessboard.getPieces(board, PIECE_COLOR.WHITE),
        [PIECE_COLOR.BLACK]: Chessboard.getPieces(board, PIECE_COLOR.BLACK),
      }
    },
    pieceMouseDown([i, j]: Square) {
      if (this.board[i][j].piece && this.board[i][j].piece.color == this.currentTurnColor) {
        this.board[i][j].active = true;
        const x = _.findIndex(this.pieces[this.currentTurnColor], piece => piece.square[0] === i && piece.square[1] === j);
        if (x >= 0) {
          for (const [a, b] of this.legalMoves[x]) {
            this.board[a as any][b as any].legalMove = true;
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
    stockfishMove(move: string) {
      const from = move.substring(0, 2);
      const to = move.substring(2);

      console.log(`${move} => ${Chessboard.algebraicToBoard(from)} -> ${Chessboard.algebraicToBoard(to)}`);

      this.pieceMove(Chessboard.algebraicToBoard(from), Chessboard.algebraicToBoard(to));
    },
    pieceMoveFromActive(toSquare: Square) {
      const fromSquare = Chessboard.getActiveSquare(this.board);
      if (toSquare) {
        this.pieceMove(fromSquare, toSquare);
      }
    },
    pieceMove([r, f]: Square, [i, j]: Square) {
      const squareIndex = _.findIndex(this.pieces[this.currentTurnColor], piece => piece.square[0] === r && piece.square[1] === f);
      if (squareIndex >= 0 && this.legalMoves[squareIndex].find(s => s[0] === i && s[1] === j)) {
        const oppositeColor = this.currentTurnColor === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;

        //Castling
        if (i === r && (r === 7 || r === 0) && f === 4 && (Math.abs(f - j) === 2)) {
          //Only possible files for king are 6 and 2
          const rookFileFrom = j === 6 ? 7 : 0;
          const rookFileTo = j === 6 ? 5 : 3;

          //Move rook to castled square
          this.board[i][rookFileTo].piece = this.board[i][rookFileFrom].piece;
          this.board[i][rookFileFrom].piece = null;
        }

        if (this.board[r][f].piece.type === PIECE_TYPE.PAWN && !this.board[i][j].piece && j != f) {
          //En passant capture
          if (this.currentTurnColor === this.color) {
            this.board[i + 1][j].piece = null;
          } else {
            this.board[i - 1][j].piece = null;
          }
        }

        //Increment fullmoves and halfmoves counters if black is moving
        if (this.currentTurnColor === PIECE_COLOR.BLACK) {
          this.fullmoves++;
          this.halfmoves++;
        }

        //Reset halfmoves counter if pawn is moving or piece is being captured
        if (this.board[r][f].piece.type === PIECE_TYPE.PAWN || this.board[i][j].piece) {
          this.halfmoves = 0;
        }

        //Update last move
        this.lastMove = {
          piece: this.board[r][f].piece,
          from: [r, f],
          to: [i, j],
        };

        //Perform a move
        const x = _.findIndex(this.pieces[this.currentTurnColor], piece => piece.square[0] === r && piece.square[1] === f);
        if (x >= 0) {
          this.pieces[this.currentTurnColor][x].square = [i, j];
          if (this.board[i][j].piece) {
            _.remove(this.pieces[oppositeColor], piece => piece.square[0] === i && piece.square[1] === j);
          }
          this.board[i][j].piece = this.board[r][f].piece;
          this.board[r][f].piece = null;
        }

        //Update castling rights before switching turn
        if (this.castlingRights[this.currentTurnColor]) {
          this.castlingRights[this.currentTurnColor] = Chessboard.updateCastlingRights(this.board, this.currentTurnColor, this.castlingRights[this.currentTurnColor]);
        }

        //Switching turn for other color
        this.currentTurnColor = this.currentTurnColor === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;

        //Compute all possible legal moves for next turn color
        this.legalMoves = this.pieces[this.currentTurnColor].map(piece => Chessboard.computeLegalMoves(this.board, piece.square, this.castlingRights[this.currentTurnColor], this.lastMove));

        this.pieceMouseUp();

        //Detect if checkmate occured
        if (!this.legalMoves.find(moves => moves.length)) {
          alert('Checkmate!');
        } else {
          if (this.currentTurnColor != this.color) {
            axios('/api/bestmove/' + Chessboard.getFen(this.board, this.castlingRights, this.halfmoves, this.fullmoves, this.currentTurnColor, this.lastMove))
            .then(response => this.stockfishMove(response.data.bestmove));
          }
        }
      } else {
        this.pieceMouseUp();
      }
    }
  },
});
