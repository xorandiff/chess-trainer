import { defineStore } from "pinia";
import { useBoardStore } from "@/stores/board";
import { ENGINE } from '@/enums';

let stockfish = new Worker('/build/stockfish11.js');

stockfish.postMessage('uci');
stockfish.postMessage('ucinewgame');

stockfish.addEventListener('message', function (e) {
    if (e.data) {
        const data = e.data as string;

        if (data[0] == 'i') {
            const d = parseInt(data.substring(11, 13).trimEnd());
            if (d == useEngineStore().stockfish.config.depth) {
                const infoRegexp = /depth\s+(?<depthString>\d+)\s+seldepth\s+(?<seldepth>[\d]+)\s+multipv\s+(?<multipv>\d+)\s+score\s+(?<score>.+)\s+nodes.*\s+pv\s+(?<pv>.+)\s+bmc/;
                const { depthString, seldepth, multipv, score, pv } = data.match(infoRegexp)!.groups!;
                const depth = parseInt(depthString);

                const variationNumber = parseInt(multipv);
            
                const cp = parseInt(score.match(/\-?\d+/)![0]);
                
                useEngineStore().response.depth = depth;
                useEngineStore().response.variations[variationNumber - 1] = {
                    pv,
                    score: cp,
                    mate: score.includes('mate')
                };
            }  
        } else if (!useEngineStore().async && data.startsWith('Total evaluation')) {
            const evalRegexp = /\s+(?<evaluation>[\-\.\d]+)\s+/;
            const { evaluation } = data.match(evalRegexp)!.groups!;

            useEngineStore().response.eval = parseFloat(evaluation);
        } else if (data.startsWith('bestmove')) {
            const matches = data.match(/[a-h][1-8][a-h][1-8]/g);
            if (matches) {
                useEngineStore().response.bestmove = matches[0];
                if (matches.length === 2) {
                    //matches[1] is ponder
                }
            }

            if (useEngineStore().async) {
                useEngineStore().resolve('Done');
            } else {
                useBoardStore().stockfishDone();
            }
        }
    }
});

export const useEngineStore = defineStore({
    id: 'engine',
    state: () => ({
        response: {
            bestmove: '',
            depth: 0,
            mate: 0,
            eval: 0,
            variations: []
        } as EngineResponse,
        async: false,
        resolve: (value: unknown) => {},
        stockfish: {
            config: {
                elo: 3000, //from 100 to 3000
                depth: 17,
                skill: 20, //from 0 to 20
                multipv: 3,
                analyseMode: true,
                evaluation: true,
                movetime: 0
            },
            working: false,
            active: false
        },
        lc0: {
            config: {
                elo: 300,
                depth: 16,
                skill: 20, //from 0 to 20
                multipv: 3,
                evaluation: true,
                movetime: 0
            },
            working: false,
            active: false
        }
    }),
    getters: {
        evalPercent: (state) => {
            let percent = 50;
            let evalMultiplied = state.response.eval * 3;
            if (evalMultiplied < -50) {
                evalMultiplied = -50;
            }
            if (evalMultiplied > 50) {
                evalMultiplied = 50;
            }
            percent -= Math.round(evalMultiplied);
            return percent;
        },
        evalFormat: (state) => {
            return (rounded?: boolean, withPlus?: boolean, overrideWithMate?: boolean) => {
                const evalCopy = state.response.eval;
                let evalFormatted = '';

                if (rounded) {
                    const evalAbs = Math.abs(evalCopy);
                    const roundFactor = evalAbs >= 10 ? 1 : 10;
                    evalFormatted = `${Math.round(evalAbs * roundFactor) / roundFactor}`;
                } else {
                    evalFormatted = `${evalCopy}`;
                }

                if (withPlus && evalCopy > 0) {
                    evalFormatted = `+${evalFormatted}`;
                }

                if (overrideWithMate && state.response.mate) {
                    evalFormatted = `M${Math.abs(state.response.mate)}`;
                }

                return evalFormatted;
            }
        },
    },
    actions: {
        run(engine : ENGINE, fen: string, keepAsync?: boolean) {
            if (!keepAsync) {
                this.async = false;
            }
            this[engine].working = true;

            if (engine === ENGINE.STOCKFISH) {
                if (this[engine].config.analyseMode) {
                    stockfish.postMessage('setoption name UCI_AnalyseMode value true');
                }
            }

            if (this[engine].config.skill < 20) {
                stockfish.postMessage(`setoption name Skill Level value ${this[engine].config.skill}`);
            }

            stockfish.postMessage(`setoption name MultiPV value ${this[engine].config.multipv}`);

            stockfish.postMessage(`position fen ${fen}`);
            
            let movetime = this[engine].config.movetime ? ` movetime ${this[engine].config.movetime}` : '';
            stockfish.postMessage(`go depth ${this[engine].config.depth}${movetime}`);

            if (this[engine].config.evaluation) {
                stockfish.postMessage(`eval`);
            }
        },
        runAsync(resolve: (value: unknown) => void, engine : ENGINE, fen: string) {
            this.async = true;
            this.resolve = resolve;
            
            this.run(engine, fen, true);
        },
        setStockfishConfig(stockfishConfigPartial: Partial<StockfishConfig>) {
            this.stockfish.config = { ...this.stockfish.config, ...stockfishConfigPartial };
        }
    }
});