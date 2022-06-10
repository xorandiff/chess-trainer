import { defineStore } from "pinia";
import axios from 'axios';
import { useBoardStore } from "@/stores/board";
import Chessboard from "@/chessboard";
import { PIECE_COLOR, PIECE_TYPE } from "@/enums";

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
        rating: 0
    }),
    actions: {
        async loadRandomPuzzle(from: number, to: number) {
            /* try {
                await axios.get('/sanctum/csrf-cookie');
                const response = await axios.get(`/api/puzzles/random/${from}/${to}`);

                const { rating, pgn } = response.data.data;

                this.rating = rating;

                const boardStore = useBoardStore();

                boardStore.loadPgnTags(pgn);
                const { fen, firstMove } = boardStore.pgn.tags;
                let solution = boardStore.pgn.tags.solution;

                if (fen && firstMove && solution) {
                    console.log(fen, firstMove);
                    boardStore.newGame(fen);

                    const moveNumberMatches = firstMove.match(/(\d+)\w/);
                    const moveNumbersMatches = solution.match(/(\b\d+)/g);

                    if (moveNumberMatches && moveNumbersMatches) {
                        const moveNumber = parseInt(moveNumberMatches[1]);

                        for (const n of moveNumbersMatches) {
                            solution = solution.replace(`${n}`, `${parseInt(n) - moveNumber + 1}`);
                        }
                        
                        let movesAlgebraicMatches = solution.match(/[BRKQN]?[a-h]?[1-8]?x?[BRKQN]?[a-h][1-8]=?[BRKQN]?\+?#?|O-O-O|O-O/g) as string[];
                        if (movesAlgebraicMatches) {
                            let { pieces, currentTurnColor } = boardStore;
                            let move = Chessboard.algebraicToMove(pieces, movesAlgebraicMatches[0], currentTurnColor);
                            if (move) {
                                this.active = true;
                                
                                boardStore.pieceMove(move.from, move.to);

                                movesAlgebraicMatches.shift();

                                boardStore.$onAction(({ name, store, args, after, onError }) => {
                                    after(result => {
                                        if (name == 'pieceMove' && !(boardStore.moves.length % 2)) {
                                            let algebraicNotation = boardStore.lastMove.algebraicNotation;
                                            if (boardStore.pieces[boardStore.lastMove.pieceIndex].type != PIECE_TYPE.PAWN) {
                                                algebraicNotation = boardStore.pieces[boardStore.lastMove.pieceIndex].type.toUpperCase() + algebraicNotation;
                                            }
                                            if (movesAlgebraicMatches[0] == algebraicNotation) {
                                                console.log('Correct!');
                                                if (movesAlgebraicMatches.length > 1) {
                                                    movesAlgebraicMatches.shift();

                                                    move = Chessboard.algebraicToMove(boardStore.pieces, movesAlgebraicMatches[0], boardStore.currentTurnColor);
                                                    if (move) {
                                                        boardStore.pieceMove(move.from, move.to);
                                                        movesAlgebraicMatches.shift();
                                                    }
                                                } else {
                                                    console.log('Puzzle completed!');
                                                }
                                            } else {
                                                console.log('Wrong!');
                                            }
                                        }
                                    });
                                });
                            }
                        }
                    }
                    
                }
            } catch (error) {
                console.log(error);
            } */
        },
        async start(time?: number) {
            try {
                await this.loadRandomPuzzle(this.ratingBounds.lower, this.ratingBounds.upper);

                this.time = time ?? 0;
                this.solvedCount = 0;
                this.mistakesCount = 0;
            } catch (error) {
                console.log(error);
            }
        }
    }
});