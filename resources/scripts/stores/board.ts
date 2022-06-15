import { message } from 'ant-design-vue';
import Chessboard from "@/chessboard";
import { useEngineStore } from "@/stores/engine";
import { ENGINE, SOUND_TYPE, PIECE_TYPE, PIECE_COLOR, CASTLING_SIDE, GAME_RESULT, HIGHLIGHT_COLOR } from '@/enums';
import { defineStore } from "pinia";
import { Howl } from "howler";
import _, { initial } from "lodash";
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
  state: () => ({
    highlights: new Array(64).fill(HIGHLIGHT_COLOR.NONE) as HIGHLIGHT_COLOR[],
    visibleLegalMoves: [] as number[],
    activeIndex: -1,
    dragging: -1,
    arrowFrom: -1,
    moves: Chessboard.create(),
    variations: [] as Variation[],
    result: GAME_RESULT.IN_PROGRESS,
    currentMoveIndex: 0,
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
  }),
  getters: {
    oppositeColor: (state) => state.moves[state.currentMoveIndex].color === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE,
    currentTurnColor: (state) => state.moves[state.currentMoveIndex].color,
    movesLength: (state) => state.moves.length - 1,
    movesReversed: (state) => state.moves.slice(1).reverse(),
    movesAlgebraic: (state) => state.moves.slice(1).map(x => x.algebraicNotation).reduce((p, c, i) => p + (i % 2 ? ` ${c} ` : `${i / 2 + 1}. ${c}`), '').trim(),
    currentMove: (state) => state.moves[state.currentMoveIndex],
    isPlayerTurn: (state) => state.moves[state.currentMoveIndex].color === state.moves[0].color,
    pieces: (state) => state.moves[state.currentMoveIndex].pieces,
    legalMoves: (state) => state.moves[state.currentMoveIndex].legalMoves,
    fen: (state) => state.moves[state.currentMoveIndex].fen,
    promotionType: (state) => state.moves[state.currentMoveIndex].promotionType,
    isWhite: (state) => state.moves[state.currentMoveIndex].color === PIECE_COLOR.WHITE,
    fullmoves: (state) => state.moves[state.currentMoveIndex].fullmoves,
    halfmoves: (state) => state.moves[state.currentMoveIndex].halfmoves,
    castlingRights: (state) => state.moves[state.currentMoveIndex].castlingRights,
    color: (state) => state.moves[0].color,
    properMoves: (state) => state.moves.slice(1),
    pieceType: (state) => {
      return (n: number) => state.moves[state.currentMoveIndex].pieces[n].toLowerCase() as PIECE_TYPE;
    },
    pieceColor: (state) => {
      return (n: number) => state.moves[state.currentMoveIndex].pieces[n].toLowerCase() === state.moves[state.currentMoveIndex].pieces[n] ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;
    }
  },
  actions: {
    newGame(fenOrPgn: string) {
      this.moves = Chessboard.create(fenOrPgn);

      this.activeIndex = -1;
      this.highlights = new Array(64).fill(HIGHLIGHT_COLOR.NONE) as HIGHLIGHT_COLOR[];
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
      this.newGame(pgn);
      this.showMove(this.moves.length - 1);

      this.openingData = Chessboard.getOpeningData(this.movesAlgebraic);

      if (this.currentMove.isCheckmate) {
        this.result = this.currentTurnColor == PIECE_COLOR.WHITE ? GAME_RESULT.WHITE_WON : GAME_RESULT.BLACK_WON;
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
      if (n !== m && this.pieces[n] && Chessboard.getColor(this.pieces[n]) !== this.currentTurnColor && this.legalMoves[n].includes(m)) {
        this.clearHighlights();
        this.activeIndex = -1;
        
        // Highlight last move
        this.highlights[n] = HIGHLIGHT_COLOR.YELLOW;
        this.highlights[m] = HIGHLIGHT_COLOR.YELLOW;
        
        // Create a new move
        const move = Chessboard.createMove(n, m, this.currentMove);

        // Update move history
        this.moves.push(move);

        this.pieceMouseUp();

        // Update currently displayed move from history
        this.currentMoveIndex++;

        // Update PGN
        this.pgn.current = Chessboard.getPGN(this.pgn.tags, this.moves);

        // Update opening data
        this.openingData = Chessboard.getOpeningData(this.movesAlgebraic);

        // Detect if checkmate/stalemate/50 move rule occured
        const isStalemate = !move.legalMoves.flat().length;
        if (this.halfmoves >= 50 || this.currentMove.isCheckmate || isStalemate) {
          if (this.halfmoves >= 50 || isStalemate) {
            this.result = GAME_RESULT.DRAW;
          } else {
            this.result = this.oppositeColor === PIECE_COLOR.WHITE ? GAME_RESULT.WHITE_WON : GAME_RESULT.BLACK_WON;
          }
          this.playMoveSound(this.currentMoveIndex);
        } else {
          this.stockfishRun();
        }
      } else {
        this.pieceMouseUp();
      }
    },
    playMoveSound(index: number) {
      let sounds: SOUND_TYPE[] = [];

      if (this.moves[index].isCheck) {
        sounds.push(SOUND_TYPE.MOVE_CHECK);
      }

      if (this.moves[index].isCheckmate) {
        sounds.push(SOUND_TYPE.GAME_END);
      }

      if (this.moves[index].isCapture) {
        sounds.push(SOUND_TYPE.CAPTURE);
      } else if (this.moves[index].castlingSide) {
        sounds.push(SOUND_TYPE.CASTLE);
      } else {
        sounds.push(this.moves[index].color === this.moves[0].color ? SOUND_TYPE.MOVE_SELF : SOUND_TYPE.MOVE_OPPONENT);
      }

      for (const sound of sounds) {
        effects[sound].play();
      }
    },
    showMove(index: number) {
      if (index >= 0 && index < this.moves.length && index != this.currentMoveIndex) {
        this.currentMoveIndex = index;
        this.playMoveSound(this.currentMoveIndex);
        
        if (!this.currentMove.isCheckmate) {
          this.stockfishRun(this.fen);
        }

        this.clearHighlights();

        if (index) {
          this.highlights[this.currentMove.from] = HIGHLIGHT_COLOR.YELLOW;
          this.highlights[this.currentMove.to] = HIGHLIGHT_COLOR.YELLOW;
        }
      }
    },
    stockfishRun(fen?: string) {
      const engine = useEngineStore();
      this.engineWorking = true;
      engine.run(ENGINE.STOCKFISH, fen ?? this.fen);
    },
    async stockfishRunAsync(fen?: string) {
      const engine = useEngineStore();
      return new Promise(resolve => {
        engine.runAsync(resolve, ENGINE.STOCKFISH, fen ?? this.fen);
      });
    },
    stockfishDone(variationsOnly?: boolean) {
      this.engineWorking = false;
      const engine = useEngineStore();

      const variationCount = engine.response.variations.length;

      //Update variations
      for (let i = 0; i < engine.response.variations.length; i++) {
        const { pv, score, mate } = engine.response.variations[i];

        const evaluation = mate ? score : (score / 100);

        this.variations[i] = {
          moves: Chessboard.getVariationData(this.currentMove, pv),
          eval: this.currentMove.color === PIECE_COLOR.WHITE ? evaluation * (-1) : evaluation,
          mate
        };
      }

      if (!variationsOnly) {
        if (!this.report.enabled && variationCount) {
          const bestMove = {
            move: this.variations[0].moves[0],
            eval: this.variations[0].eval,
            mate: this.variations[0].mate
          };
  
          //Update best next move
          this.moves[this.currentMoveIndex].bestNextMove = bestMove;
  
          //Update move mark
          if (this.showFeedback) {
            this.moves[this.currentMoveIndex].mark = Chessboard.getMoveFeedback(this.moves, this.movesAlgebraic, this.openingData, this.currentMoveIndex, this.variations);
          } 
        }
  
        if ((!this.isPlayerTurn && this.stockfish) || this.alwaysStockfish) {
          const n = Chessboard.a2i(engine.response.bestmove.substring(0, 2));
          const m = Chessboard.a2i(engine.response.bestmove.substring(2, 4));
  
          if (engine.response.bestmove.length > 4) {
            this.moves[this.currentMoveIndex].promotionType = engine.response.bestmove[4] as PIECE_TYPE;
          }
          
          this.clearHighlights();
  
          this.pieceMove(n, m);
        }
      }

      
    },
    setPromotionPiece(pieceType: PIECE_TYPE) {
      this.moves[this.currentMoveIndex].promotionType = pieceType;

      this.promotionModalVisible = false;
      this.pieceMove(this.promotionMove.from, this.promotionMove.to);

      this.moves[this.currentMoveIndex].promotionType = PIECE_TYPE.NONE;
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
    setArrowFrom(n: number) {
      this.arrowFrom = n;
    },
    setArrowTo(m: number, color: HIGHLIGHT_COLOR) {
      if (this.arrowFrom && this.arrowFrom !== m) {
        const arrow = this.arrows.find(arrow => arrow.from === this.arrowFrom && arrow.to === m);
        if (arrow) {
          //Remove an arrow, because it exist
          this.arrows = this.arrows.filter(arrow => arrow.from !== this.arrowFrom || arrow.to !== m);
        }
        if (!arrow || arrow.color !== color) {
          const { transform, points } = Chessboard.getArrowCoordinates(this.arrowFrom, m);
          //Add an arrow
          this.arrows.push({
            color,
            from: this.arrowFrom,
            to: m,
            transform,
            points
          });
        }
      } else {
        this.setHighlightColor(m, color);
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

      //Do report computations for each move
      for (let i = 1; i < movesLength; i++) {
        const currentColor = this.moves[i].color;
        
        this.report.generation.progress = Math.floor(i / movesLength * 100);

        await this.stockfishRunAsync(this.moves[i].fen);

        variations = [];

        //Update algebraic move list
        if (currentColor == PIECE_COLOR.WHITE) {
          if (i > 1) {
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
            moves: Chessboard.getVariationData(this.moves[i], pv, true),
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
      }
      this.report.enabled = true;

      this.variations = variations;
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
