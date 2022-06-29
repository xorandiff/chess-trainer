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
            await axios.get('/sanctum/csrf-cookie');
            const response = await axios.get(`/api/puzzles/random/${from}/${to}`);

            const { rating, pgn } = response.data.data;

            this.rating = rating;

            const boardStore = useBoardStore();

            boardStore.loadPgnTags(pgn);
            const { fen, firstMove } = boardStore.pgn.tags;
            let solution = boardStore.pgn.tags.solution;

            if (!fen || !firstMove || !solution) {
                throw 'Incomplete puzzle data';
            }

            console.log(fen, firstMove);

            // Initialize board from puzzle FEN
            boardStore.newGame(fen);

            const moveNumberMatches = firstMove.match(/(\d+)\w/);
            const moveNumbersMatches = solution.match(/(\b\d+)/g);

            if (!moveNumberMatches || !moveNumbersMatches) {
                throw `couldn't match either first move number or solution moves numbers`;
            }

            const moveNumber = parseInt(moveNumberMatches[1]);

            // Shift solution move numbers, s. t. they start from move no. 1
            for (const n of moveNumbersMatches) {
                solution = solution.replace(`${n}`, `${parseInt(n) - moveNumber + 1}`);
            }
            
            let movesAlgebraicMatches = solution.match(/[BRKQN]?[a-h]?[1-8]?x?[BRKQN]?[a-h][1-8]=?[BRKQN]?\+?#?|O-O-O|O-O/g) as string[];
            
            if (!movesAlgebraicMatches) {
                throw 'Error during algebraic solution moves matching';
            }
            
            let move = Chessboard.algebraicToMove(boardStore.currentMove, movesAlgebraicMatches[0]);

            if (!move) {
                throw `Couldn't convert algebraic move into move object`;
            }
            
            this.active = true;
                
            boardStore.pieceMove(move.from, move.to);

            movesAlgebraicMatches.shift();

            boardStore.$onAction(({ name, after }) => {
                after(result => {
                    if (name === 'pieceMove' && !(boardStore.moves.length % 2)) {
                        let algebraicNotation = boardStore.currentMove.algebraicNotation;
                        if (boardStore.currentMove.type !== PIECE_TYPE.PAWN) {
                            algebraicNotation = boardStore.currentMove.type.toUpperCase() + algebraicNotation;
                        }
                        if (movesAlgebraicMatches[0] === algebraicNotation) {
                            console.log('Correct!');
                            if (movesAlgebraicMatches.length > 1) {
                                movesAlgebraicMatches.shift();

                                move = Chessboard.algebraicToMove(boardStore.currentMove, movesAlgebraicMatches[0]);
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
        },
        async start(time?: number) {
            await this.loadRandomPuzzle(this.ratingBounds.lower, this.ratingBounds.upper);

            this.time = time ?? 0;
            this.solvedCount = 0;
            this.mistakesCount = 0;
        }
    }
});
