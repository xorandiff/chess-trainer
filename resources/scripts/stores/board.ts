import { message } from 'ant-design-vue';
import Chessboard from "@/chessboard";
import { useEngineStore } from "@/stores/engine";
import { ENGINE, SOUND_TYPE, PIECE_TYPE, PIECE_COLOR, CASTLING_SIDE, GAME_RESULT, HIGHLIGHT_COLOR } from '@/enums';
import { defineStore } from "pinia";
import { Howl } from "howler";
import _ from "lodash";
import axios from "axios";

axios.defaults.withCredentials = true;

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
    const chessboard = Chessboard.create('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const { initialFen, pieces, castlingRights, halfmoves, fullmoves, color } = chessboard;
    let legalMoves: number[][] = new Array(64).fill([]);
    legalMoves = legalMoves.map((legalMoves, n) => Chessboard.computeLegalMoves(pieces, n, castlingRights[color], {} as Move));

    return ({
      highlights: new Array(64).fill(HIGHLIGHT_COLOR.NONE) as HIGHLIGHT_COLOR[],
      legalMoves,
      visibleLegalMoves: [] as number[],
      initialFen,
      activeIndex: -1,
      dragging: -1,
      arrowFrom: -1,
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
      promotionType: PIECE_TYPE.NONE,
      currentMoveIndex: -1,
      stockfish: false,
      alwaysStockfish: false,
      showFeedback: true,
      showVariations: true,
      showEvaluation: true,
      report: {
        enabled: false,
        generation: {
          active: false,
          progress: 0 //From 0 to 100, as percents
        }
      },
      options: {
        visibility: {
          evaluation: true,
          variations: true,
          feedback: false
        }
      },
      arrows: [] as Arrow[],
      pgn: {
        current: '',
        saved: '',
        tags: {
            event: '',
            site: '',
            date: '',
            round: '',
            white: '',
            black: '',
            result: ''
          } as PgnTags
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
      engineWorking: false,
      gameId: '',
      savedAnalysis: [] as any[]
    });
  },
  getters: {
    oppositeColor: (state) => state.currentTurnColor === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE,
    movesLength: (state) => state.moves.length,
    movesReversed: (state) => state.moves.slice().reverse(),
    currentMove: (state) => state.currentMoveIndex ? state.moves[state.currentMoveIndex] : false,
    isPlayerTurn: (state) => state.currentTurnColor == state.color,
    pieceType: (state) => {
      return (n: number) => state.pieces[n].toLowerCase() as PIECE_TYPE;
    },
    pieceColor: (state) => {
      return (n: number) => state.pieces[n].toLowerCase() == state.pieces[n] ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;
    },
    moveType: (state) => {
      return (n: number) => state.moves[n].pieces[state.moves[n].to].toLowerCase();
    },
    moveColor: (state) => {
      return (n: number) => state.moves[n].pieces[state.moves[n].to].toLowerCase() == state.moves[n].pieces[state.moves[n].to] ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;
    },
    fenPieces: (state) => {
      let fenPieces = '';
      let emptyCount = 0;
      for (let i = 0; i < 64; i++) {
        if (i && !(i % 8)) {
          if (emptyCount) {
            fenPieces += `${emptyCount}`;
            emptyCount = 0;
          }
          fenPieces += '/';
        } else if (state.pieces[i]) {
          if (emptyCount) {
            fenPieces += `${emptyCount}`;
            emptyCount = 0;
          } else {
            fenPieces += state.pieces[i];
          }
        } else {
          emptyCount++;
        }
      }
      return fenPieces;
    }
  },
  actions: {
    newGame(fen: string) {
      const chessboard = Chessboard.create(fen);
      const { pieces, castlingRights } = chessboard;
      const color = PIECE_COLOR.WHITE;

      this.activeIndex = -1;
      this.highlights = new Array(64).fill(HIGHLIGHT_COLOR.NONE) as HIGHLIGHT_COLOR[];
      this.legalMoves = new Array(64).fill([]);
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
    },
    loadPgnTags(pgn: string) {
      for (const row of pgn.split("\n")) {
        const matches = row.match(/\[(\w+)\s+"(.+)"\]/i);
        if (matches) {
          const tagName = matches[1];
          const tagValue = matches[2];

          switch (tagName.toLowerCase()) {
            case 'event': this.pgn.tags.event = tagValue; break;
            case 'site': this.pgn.tags.site = tagValue; break;
            case 'date': this.pgn.tags.date = tagValue; break;
            case 'round': this.pgn.tags.round = tagValue; break;
            case 'white': this.pgn.tags.white = tagValue; break;
            case 'black': this.pgn.tags.black = tagValue; break;
            case 'result': this.pgn.tags.result = tagValue; break;
            case 'fen': this.pgn.tags.fen = tagValue; break;
            case 'firstmove': this.pgn.tags.firstMove = tagValue; break;
            case 'full': this.pgn.tags.solution = tagValue; break;
            default: break;
          }
        }
      }
    },
    loadPGN(pgn: string) {
      this.pgn.current = pgn;
      this.result = GAME_RESULT.IN_PROGRESS;

      this.loadPgnTags(pgn);
      
      const chessboard = Chessboard.create(pgn);
      const { pieces, castlingRights, halfmoves, fullmoves, color, moves } = chessboard;

      this.color = color;
      this.castlingRights = castlingRights;
      this.halfmoves = halfmoves;
      this.fullmoves = fullmoves;
      this.pieces = pieces;
      this.moves = moves;
      this.movesAlgebraic = pgn.slice(pgn.lastIndexOf(']') + 1).trim();
      this.openingData = Chessboard.getOpeningData(this.movesAlgebraic);
      if (this.moves[this.moves.length - 1].isCheckmate) {
        this.result = this.moveColor(this.moves.length - 1) == PIECE_COLOR.WHITE ? GAME_RESULT.WHITE_WON : GAME_RESULT.BLACK_WON;
      }
      this.currentMoveIndex = this.moves.length - 1;

      if (moves.length) {
        this.currentTurnColor = moves.length % 2 ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;
        this.pieces = Chessboard.fenToPiecesArray(moves[moves.length - 1].fen);
        this.stockfishRun();
      }
    },
    setHighlightColor(n: number, color: HIGHLIGHT_COLOR) {
      if (!this.highlights[n] || this.highlights[n] !== color) {
        this.highlights[n] = color;
      } else {
        this.highlights[n] = HIGHLIGHT_COLOR.NONE;
      }
    },
    pieceMouseDown(n: number) {
      console.log(...this.legalMoves[n]);
      if (this.result) {
        return;
      } else if (!this.pieces[n] && !this.visibleLegalMoves.includes(n)) {
        this.activeIndex = -1;
        this.visibleLegalMoves = [];
      }

      this.clearHighlights();

      this.pieceMoveFromActive(n);
      
      if (this.pieces[n] && this.currentMoveIndex === this.moves.length - 1) {
        //Set coordinates of current dragged piece
        this.dragging = n;

        //Make square background in active orange color
        this.highlights[n] = HIGHLIGHT_COLOR.ORANGE;
        this.activeIndex = n;
        
        this.visibleLegalMoves = this.pieceColor(n) === this.currentTurnColor ? [ ...this.legalMoves[n] ] : [];
      }
    },
    pieceMouseUp() {
      //Set non-existing dragging coordinates
      this.dragging = -1;
    },
    clearHighlights() {
      for (let i = 0; i < 64; i++) {
        this.highlights[i] = HIGHLIGHT_COLOR.NONE;
      }
    },
    clearColoredHighlights() {
      this.clearHighlights();
      this.arrows = [] as Arrow[];
    },
    pieceMoveFromActive(m: number) {
      if (this.activeIndex >= 0 && this.pieces[this.activeIndex] && this.activeIndex !== m) {
        const color = this.pieceColor(this.activeIndex);

        const toRank = (m / 8) >> 0;

        if (this.promotionType === PIECE_TYPE.PAWN && this.pieceType(this.activeIndex) === PIECE_TYPE.PAWN && ((color === PIECE_COLOR.WHITE && !toRank) || (color === PIECE_COLOR.BLACK && toRank === 7))) {
          /**
           * Promotion move detected, instead of performing this move, first show
           * popover for user in order to select promotion piece
           */
          this.promotionMove.from = this.activeIndex;
          this.promotionMove.to = m;
          this.promotionModalVisible = true;
        } else {
          this.visibleLegalMoves = [];
          this.pieceMove(this.activeIndex, m);
        }
      }
    },
    pieceMove(n: number, m: number) {
      if (n != m && this.pieces[n] && this.pieceColor(n) === this.currentTurnColor && this.legalMoves[n].includes(m)) {
        this.clearHighlights();
        this.activeIndex = -1;

        const i = (n / 8 >> 0) + 1;
        const j = (n % 8) + 1;

        const r = (m / 8 >> 0) + 1;
        const f = (m & 8) + 1;
        
        let sound = SOUND_TYPE.MOVE_SELF;

        // Move variables
        let castlingSide: boolean | CASTLING_SIDE = false;
        let isCapture = false;
        let promotionType = PIECE_TYPE.NONE;
        let isCheck = false;

        //Castling
        if (i === r && [1, 8].includes(r) && f === 5 && (Math.abs(f - j) === 2)) {
          // Only possible files for king are 7 and 3
          const rookFileFrom = j === 7 ? 8 : 1;
          const rookFileTo = j === 7 ? 6 : 4;

          sound = SOUND_TYPE.CASTLE;
          castlingSide = rookFileFrom === 8 ? CASTLING_SIDE.KINGSIDE : CASTLING_SIDE.QUEENSIDE;
          
          // Move rook to castled square
          Chessboard.makeMove(this.pieces, [i, rookFileFrom], [i, rookFileTo]);
        }

        let enPassantTargetSquare = '';

        if (this.pieceType(n) == PIECE_TYPE.PAWN) {
          if (this.pieces[m] && j != f) {
            // En passant capture
            isCapture = true;
            const captureIndex = Chessboard.c2i(this.isPlayerTurn ? i + 1 : i - 1, j);
            this.pieces[captureIndex] = '';
          } else if (Math.abs(i - r) == 2) {
            enPassantTargetSquare = `${m}`;
          }
        }

        if (this.pieces[m]) {
          isCapture = true;
        }

        // Increment fullmoves and halfmoves counters if black is moving
        if (this.currentTurnColor === PIECE_COLOR.BLACK) {
          this.fullmoves++;
          this.halfmoves++;
        }

        // Reset halfmoves counter if pawn is moving or piece is being captured
        if (this.pieceType(n) == PIECE_TYPE.PAWN || this.pieces[m]) {
          this.halfmoves = 0;
        }

        // Highlight last move
        this.highlights[n] = HIGHLIGHT_COLOR.YELLOW;
        this.highlights[m] = HIGHLIGHT_COLOR.YELLOW;

        // Set proper sound type
        if (sound === SOUND_TYPE.MOVE_SELF) {
          if (this.pieces[m]) {
            sound = SOUND_TYPE.CAPTURE;
          } else {
            sound = this.currentTurnColor === this.color ? SOUND_TYPE.MOVE_SELF : SOUND_TYPE.MOVE_OPPONENT;
          } 
        }

        // Update last move
        let move: Move = {
          pieces: [ ...this.pieces ],
          fen: '',
          from: n,
          to: m,
          isCapture,
          isCheck,
          isCheckmate: false,
          castlingSide,
          promotionType,
          algebraicNotation: '',
          sound,
          mark: -1
        };

        // Perform a move
        Chessboard.makeMove(this.pieces, n, m);

        // Check wheter move triggers promotion
        if (this.pieceType(m) === PIECE_TYPE.PAWN && [1, 8].includes(i)) {
          // Promote a pawn
          this.pieces[m] = this.promotionType;

          // Store promotion type into current move data
          promotionType = this.promotionType;
        }

        // Update castling rights before switching turn
        if (this.castlingRights[this.currentTurnColor]) {
          this.castlingRights[this.currentTurnColor] = Chessboard.updateCastlingRights(this.pieces, this.currentTurnColor, this.castlingRights[this.currentTurnColor]);
        }

        // Switching turn for other color
        this.currentTurnColor = this.currentTurnColor === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;

        this.pieceMouseUp();

        // Detect if check occured
        if (Chessboard.detectCheck(this.pieces, this.currentTurnColor)) {
          move.isCheck = true;
          effects[SOUND_TYPE.MOVE_CHECK].play();
        }

        move.sound = sound;

        move.algebraicNotation = Chessboard.moveToAlgebraic(move, [ ...this.legalMoves ]);

        // Compute legal moves for next move
        this.legalMoves = this.legalMoves.map((legalMoves, n) => Chessboard.computeLegalMoves(this.pieces, n, this.castlingRights[this.currentTurnColor], move));

        const hasOpponentLegalMoves = this.pieces.find((piece, n) => piece && Chessboard.getColor(piece) === this.currentTurnColor && this.legalMoves[n]) !== undefined;
        const hasLegalMoves = this.pieces.find((piece, n) => piece && Chessboard.getColor(piece) === this.oppositeColor && this.legalMoves[n]) !== undefined;
        move.isCheckmate = !hasOpponentLegalMoves && hasLegalMoves;
        const isStalemate = !hasOpponentLegalMoves && !hasLegalMoves;
        

        let castlingRights = `${this.castlingRights[PIECE_COLOR.WHITE].join('')}${this.castlingRights[PIECE_COLOR.BLACK].join('')}`;

        // Update FEN string for current move
        move.fen = `${this.fenPieces} ${this.currentTurnColor} ${castlingRights} ${enPassantTargetSquare} ${this.halfmoves} ${this.fullmoves}`;
        move.pieces = [ ...this.pieces ];

        // Update algebraic move list
        if (this.pieceColor(n) === PIECE_COLOR.WHITE) {
          this.movesAlgebraic += `${Math.floor((this.currentMoveIndex + 1) / 2) + 1}. ${move.algebraicNotation}`;
        } else {
          this.movesAlgebraic += ` ${move.algebraicNotation}`;
        }

        // Update move history
        this.moves.push(move);

        // Update last move
        this.lastMove = move;

        // Update currently displayed move from history
        this.currentMoveIndex++;

        // Update PGN
        this.pgn.current = Chessboard.getPGN(this.pgn.tags, this.moves);

        // Update opening data
        this.openingData = Chessboard.getOpeningData(this.movesAlgebraic);

        // Detect if checkmate/stalemate/50 move rule occured
        if (this.halfmoves >= 50 || move.isCheckmate || isStalemate) {
          if (this.halfmoves >= 50) {
            // 50 move rule reached, draw
            this.result = GAME_RESULT.DRAW;
          } else if (isStalemate) {
            // Stalemate
            this.result = GAME_RESULT.DRAW;
          } else {
            // Checkmate
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
      if (index >= 0 && index < this.moves.length && index != this.currentMoveIndex) {
        this.pieces = [ ...this.moves[index].pieces ];
        this.currentMoveIndex = index;
        
        if (this.moves[index].isCheckmate) {
          this.variations = [];
        } else {
          this.stockfishRun(this.moves[index].fen);
        }

        effects[this.moves[index].sound].play();

        const v = this.moves[index].from;
        const w = this.moves[index].to;
        

        for (let i = 0; i < 64; i++) {
          this.highlights[i] = (i === v || i === w) ? HIGHLIGHT_COLOR.YELLOW : HIGHLIGHT_COLOR.NONE;
        }
      }
    },
    stockfishRun(fen?: string) {
      const engine = useEngineStore();
      this.engineWorking = true;
      engine.run(ENGINE.STOCKFISH, fen ?? this.lastMove.fen);
    },
    async stockfishRunAsync(fen?: string) {
      const engine = useEngineStore();
      return new Promise(resolve => {
        engine.runAsync(resolve, ENGINE.STOCKFISH, fen ?? this.lastMove.fen);
      });
    },
    stockfishDone(variationsOnly?: boolean) {
      this.engineWorking = false;
      const engine = useEngineStore();

      return;

      if (this.currentMoveIndex >= 0) {
        //Update variations
        for (let i = 0; i < engine.response.variations.length; i++) {
          const { pv, score, mate } = engine.response.variations[i];

          const evaluation = mate ? score : (score / 100);

          this.variations[i] = {
            ...Chessboard.getVariationData([ ...this.pieces ], pv, this.castlingRights[PIECE_COLOR.WHITE], this.castlingRights[PIECE_COLOR.BLACK]),
            eval: this.moveColor(this.currentMoveIndex) === PIECE_COLOR.WHITE ? evaluation * (-1) : evaluation,
            mate
          };

          if (!variationsOnly && !this.report.enabled && this.moves.length > 0 && !i) {
            const bestMove = {
              move: this.variations[i].moves[0],
              eval: this.variations[i].eval,
              mate
            };

            //Update best next move
            this.moves[this.currentMoveIndex].bestNextMove = bestMove;

            //Update move mark
            if (this.showFeedback) {
              this.moves[this.currentMoveIndex].mark = Chessboard.getMoveFeedback(this.moves, this.movesAlgebraic, this.openingData, this.currentMoveIndex, this.variations);
            } 
          }
        }
      }

      if (!variationsOnly && (this.currentTurnColor != this.color && this.stockfish) || this.alwaysStockfish) {
        const from = engine.response.bestmove.substring(0, 2);
        const to = engine.response.bestmove.substring(2, 4);

        const v = Chessboard.a2i(from);
        const w = Chessboard.a2i(to);

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
    setArrowTo(w: number, color: HIGHLIGHT_COLOR) {
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
      const engine = useEngineStore();

      //Set report generation to true
      this.report.generation.active = true;

      //Store current Stockfish configuration
      let stockfishConfig: StockfishConfig = engine.stockfish.config;

      //Set Stockfish config for report generation
      engine.setStockfishConfig({ depth: 12 });

      //Prepare game data for report computations
      let movesLength = this.moves.length;
      let variations: Variation[] = [];
      let movesAlgebraic = '';
      let openingData: OpeningData = {
        name: 'None',
          eco: '',
          fen: '',
          movesAlgebraic: ''
      };

      //Set pieces structure as in first move
      let pieces = [ ...this.moves[0].pieces ];

      //Do report computations for each move
      for (let i = 0; i < movesLength; i++) {
        const currentColor = this.moveColor(i);
        
        this.report.generation.progress = Math.floor(i / movesLength * 100);

        await this.stockfishRunAsync(this.moves[i].fen);

        variations = [];

        //Update algebraic move list
        if (currentColor == PIECE_COLOR.WHITE) {
          if (i > 0) {
            movesAlgebraic += ` `;
          }
          movesAlgebraic += `${Math.floor(i / 2) + 1}. ${this.moves[i].algebraicNotation}`;
        } else {
          movesAlgebraic += ` ${this.moves[i].algebraicNotation}`;
        }

        openingData = Chessboard.getOpeningData(movesAlgebraic);

        for (let j = 0; j < engine.response.variations.length; j++) {
          const { pv, score, mate } = engine.response.variations[j];
          const evaluation = mate ? score : (score / 100);

          variations[j] = {
            ...Chessboard.getVariationData([ ...pieces ], pv, this.castlingRights[PIECE_COLOR.WHITE], this.castlingRights[PIECE_COLOR.BLACK], true),
            eval: currentColor === PIECE_COLOR.WHITE ? evaluation * (-1) : evaluation,
            mate
          };

          if (j == 0) {
            this.moves[i].bestNextMove = {
              move: variations[j].moves[0],
              eval: variations[j].eval,
              mate
            };
            this.moves[i].mark = Chessboard.getMoveFeedback(this.moves, movesAlgebraic, openingData, i, variations);
          }
        }

        if (i < movesLength - 1) {
          pieces = [ ...this.moves[i + 1].pieces ];
        }
      }
      this.report.enabled = true;

      this.pieces = pieces;
      this.variations = variations;
      this.movesAlgebraic = movesAlgebraic;
      this.openingData = openingData;

      //Restore Stockfish configuration
      engine.setStockfishConfig(stockfishConfig);

      this.options.visibility.feedback = true;
      this.report.generation.active = false;

      message.success('Report successfully generated');
    },
    toggleEvaluation() {
      this.options.visibility.evaluation = !this.options.visibility.evaluation;
    },
    toggleVariations() {
      this.options.visibility.variations = !this.options.visibility.variations;
    },
    toggleFeedback() {
      this.options.visibility.feedback = !this.options.visibility.feedback;
    },
    updatePgnTags() {
      let pgnMoves = this.pgn.current.split('\n\n')[1];
      this.pgn.current = Chessboard.getPgnTags(this.pgn.tags) + '\n' + pgnMoves;
    },
    async saveAnalysis() {
      try {
        this.pgn.current = Chessboard.getPGN(this.pgn.tags, this.moves);
        
        await axios.get('/sanctum/csrf-cookie');
        const response = await axios.post('/api/games', { pgn: this.pgn.current });

        const { id } = response.data.data;
        
        this.gameId = id;

        message.success('Analysis successfully saved');
      } catch (error) {
          console.log(error);
          message.error('An error occured during saving your analysis');
      }               
    },
    async addNewPuzzle(pgn: string, rating: number) {
      try {
        const pgnTags = pgn.slice(0, pgn.lastIndexOf(']') + 1).replaceAll(/\][^\[]+\[/gm, `]\n[`).replaceAll(/\d+\.[\.\s]+/gm, '').trim();
        const pgnMoves = pgn.slice(pgn.lastIndexOf(']') + 1).replaceAll(/[\n\s]+/gm, ' ').trim();
        const formattedPgn = pgnTags + `\n\n` + pgnMoves;
        
        await axios.get('/sanctum/csrf-cookie');
        await axios.post('/api/puzzles', { pgn: formattedPgn, rating });

        message.success('Puzzle successfully added');
      } catch (error) {
          console.log(error);
          message.error('An error occured during adding your puzzle');
      }               
    },
    async updateAnalysis() {
      try {
        this.pgn.current = Chessboard.getPGN(this.pgn.tags, this.moves);

        await axios.get('/sanctum/csrf-cookie');
        const response = await axios.patch(`/api/games/${this.gameId}`, { pgn: this.pgn.current, ...this.pgn.tags });

        const { pgn } = response.data.data;

        this.pgn.saved = pgn;
        
        message.success('Analysis successfully saved');
      } catch (error) {
          console.log(error);
          message.error('An error occured during saving your analysis');
      }               
    },
    async deleteAnalysis(gameId: string) {
      try {
        await axios.get('/sanctum/csrf-cookie');
        await axios.delete(`/api/games/${gameId}`);
        await this.loadAnalysisList();
        
        message.success('Analysis successfully deleted');
      } catch (error) {
          console.log(error);
          message.error('An error occured during deletion of your analysis');
      }               
    },
    async loadAnalysis(gameId?: string) {
      try {
        await axios.get('/sanctum/csrf-cookie');
        const response = await axios.get(gameId ? `/api/games/${gameId}` : '/api/game');

        const { id, pgn } = response.data.data;
        
        this.gameId = id;
        this.pgn.saved = pgn;

        this.loadPGN(pgn);
      } catch (error) {
          console.log(error);
      }               
    },
    async loadAnalysisList() {
      try {
        await axios.get('/sanctum/csrf-cookie');
        const response = await axios.get('/api/games');

        const analysisList = response.data.data;

        this.savedAnalysis = [];
        let i = 1;
        for (const id in analysisList) {
          this.savedAnalysis.push({
            key: `${i}`,
            id: analysisList[id]['id'],
            white: analysisList[id]['white'],
            black: analysisList[id]['black'],
            site: analysisList[id]['site'],
            event: analysisList[id]['event'],
            date: analysisList[id]['date'],
          });
          i++;
        }
      } catch (error) {
          console.log(error);
      }               
    }
  },
});
