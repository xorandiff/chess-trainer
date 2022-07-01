import { defineStore } from "pinia";
import axios from 'axios';
import { useBoardStore } from "@/stores/board";
import Chessboard from "@/chessboard";
import { HIGHLIGHT_COLOR, PIECE_COLOR } from "@/enums";

axios.defaults.withCredentials = true;

export const usePuzzleStore = defineStore({
    id: 'puzzle',
    state: () => ({
        active: false,
        completed: false,
        time: 0,
        solvedCount: 0,
        mistakesCount: 0,
        ratingBounds: {
            lower: 0,
            upper: 3000
        },
        color: PIECE_COLOR.WHITE,
        rating: 0,
        solution: [] as string[],
        finished: [] as PuzzleInfo[]
    }),
    getters: {
        longestStreak: (state) => {
            let longestCount = 0;
            let streakCount = 0;

            for (const puzzleInfo of state.finished) {
                if (puzzleInfo.solved) {
                    streakCount++;
                } else {
                    if (streakCount > longestCount) {
                        longestCount = streakCount;
                    }
                    streakCount = 0;
                }
            }

            if (streakCount > longestCount) {
                longestCount = streakCount;
            }

            return longestCount;
        },
        highestSolved: state => state.finished.filter(x => x.solved).sort().pop()
    },
    actions: {
        async loadRandomPuzzle(from: number, to: number) {
            // Fetch random puzzle from database
            await axios.get('/sanctum/csrf-cookie');
            const response = await axios.get(`/api/puzzles/random/${from}/${to}`);

            const { rating, pgn } = response.data.data;

            const boardStore = useBoardStore();

            // Parse puzzle's PGN tags
            boardStore.loadPgnTags(pgn);
            const { fen, firstMove } = boardStore.pgn.tags;
            const solution = boardStore.pgn.tags.solution;

            // Check if required extra tags are present
            if (!fen || !firstMove || !solution) {
                console.log(boardStore.pgn.tags);
                throw `Puzzle PGN doesn't have required tags`;
            }

            // Initialize board from puzzle's FEN string
            boardStore.newGame(fen);
            
            // Parse algebraic solution moves into string array
            let movesAlgebraicMatches = solution.match(/[BRKQN]?[a-h]?[1-8]?x?[BRKQN]?[a-h][1-8]=?[BRKQN]?\+?#?|O-O-O|O-O/g);
            if (!movesAlgebraicMatches) {
                throw `One of puzzle's solution algebraic moves is not recognized as a valid move`;
            }

            this.solution = movesAlgebraicMatches;
            
            // Convert first puzzle's algebraic move into move object
            let move = Chessboard.algebraicToMove(boardStore.moves[0], this.solution[0]);
            if (!move) {
                throw `Cannot convert first puzzle's algebraic move into move object`;
            }

            if (typeof rating != 'number' && parseInt(rating) === NaN) {
                throw `Puzzle rating from server response is not (can't be converted to) a number`;
            }
            
            // Set rating of current puzzle
            this.rating = parseInt(rating);
            
            // Set player color of current puzzle
            this.color = move.color === PIECE_COLOR.WHITE ? PIECE_COLOR.BLACK : PIECE_COLOR.WHITE;

            // Adjust board perspective in accordance with player's pieces color
            boardStore.flipped = this.color === PIECE_COLOR.WHITE ? false : true;

            this.active = true;

            // Perform initial computer move of current puzzle
            boardStore.pieceMove(move.from, move.to);

            // Remove computer move from solution moves
            this.solution = this.solution.slice(1);

            /**
             * Attach a listener for detecting player moves and check 
             * if moves are correct or not. Each correct move removes 
             * corresponding solution algebraic move. 
             * 
             * We stop subscription to board store either when there are 
             * no more solution moves left (which means puzzle is solved) 
             * or player makes a mistake.  
             */
            const unsubscribe = boardStore.$onAction(({ name, after }) => {
                after(result => {
                    if (name === 'loadPGN') {
                        // Detach the listener function after loading PGN in board store
                        unsubscribe();
                    } else if (name === 'playerMoved' && (boardStore.moves.length % 2) ) {
                        // We check if player made a correct move
                        if (this.solution[0].replace(/[\+#]/, '') === boardStore.currentMove.algebraicNotation.replace(/[\+#]/, '')) {
                            // Highlight player's move coordinates in green color
                            boardStore.setHighlightColor(boardStore.currentMove, HIGHLIGHT_COLOR.EXCELLENT_MOVE);

                            // Remove player's correct move from solution moves list
                            this.solution = this.solution.slice(1);

                            if (this.solution.length > 1) {
                                // Convert next computer solution move into move object
                                move = Chessboard.algebraicToMove(boardStore.currentMove, this.solution[0]);
                                if (move) {
                                    // Perform next computer solution move
                                    boardStore.pieceMove(move.from, move.to);

                                    // Remove next computer solution move from solution moves list
                                    this.solution = this.solution.slice(1);
                                } else {
                                    console.log('Cannot convert solution algebraic move intto move object');
                                }
                            } else {
                                // There are no more solution moves, mark puzzle as done
                                this.puzzleDone();
                            }
                        } else {
                            console.log(`Wrong move, player move is ${boardStore.currentMove.algebraicNotation.replace(/[\+#]/, '')}, but correct should be ${this.solution[0].replace(/[\+#]/, '')}`);
                            // Highlight player's move coordinates in red color
                            boardStore.setHighlightColor(boardStore.currentMove, HIGHLIGHT_COLOR.BLUNDER);

                            // Player made a wrong move, mark puzzle as done
                            this.puzzleDone();
                        }
                    }
                });
            });
        },
        async start(time?: number) {
            this.$reset;
            try {
                await this.loadRandomPuzzle(this.ratingBounds.lower, this.ratingBounds.upper);
            } catch (error) {
                console.log(error);
            }
        },
        async puzzleDone() {
            let puzzleInfo: PuzzleInfo = {
                rating: this.rating,
                solved: false
            };
            if (this.solution.length) {
                // Puzzle is not solved correctly
                this.mistakesCount++;
            } else {
                // Puzzle is solved correctly, show next puzzle
                this.solvedCount++;
                puzzleInfo.solved = true;
            }

            this.finished.push(puzzleInfo);

            if (this.mistakesCount < 3) {
                try {
                    await this.loadRandomPuzzle(this.ratingBounds.lower, this.ratingBounds.upper);
                } catch (error) {
                    console.log(error);
                }
            } else {
                this.completed = true;
            }
        }
    }
});
