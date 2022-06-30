import { defineStore } from "pinia";
import axios from 'axios';
import { useBoardStore } from "@/stores/board";
import Chessboard from "@/chessboard";
import { PIECE_COLOR } from "@/enums";

axios.defaults.withCredentials = true;

export const usePuzzleStore = defineStore({
    id: 'puzzle',
    state: () => ({
        active: false,
        time: 0,
        solvedCount: 0,
        mistakesCount: 0,
        ratingBounds: {
            lower: 0,
            upper: 1000
        },
        color: PIECE_COLOR.WHITE,
        rating: 0,
        solution: [] as string[],
        finished: [] as PuzzleInfo[]
    }),
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
                    if (name === 'playerMoved' && (boardStore.moves.length % 2) ) {
                        // We check if player made a correct move
                        if (this.solution[0] === boardStore.currentMove.algebraicNotation) {
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
                                unsubscribe();
                                this.puzzleDone();
                            }
                        } else {
                            console.log(`Wrong move, player move is ${boardStore.currentMove.algebraicNotation}, but correct should be ${this.solution[0]}`);
                            // Player made a wrong move, mark puzzle as done
                            unsubscribe();
                            this.puzzleDone();
                        }
                    }
                });
            });
        },
        async start(time?: number) {
            try {
                await this.loadRandomPuzzle(this.ratingBounds.lower, this.ratingBounds.upper);
            } catch (error) {
                console.log(error);
            }

            this.time = time ?? 0;
            this.solvedCount = 0;
            this.mistakesCount = 0;
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
            }
        }
    }
});
