import { defineStore } from "pinia";
import { useBoardStore } from "@/stores/board";
import type { ENGINE } from '@/enums';

const DEFAULT_DEPTH_STOCKFISH = 18;
const DEFAULT_DEPTH_LC0 = 18;

let stockfish = new Worker('/build/stockfish11.js');

stockfish.postMessage('uci');
stockfish.postMessage('ucinewgame');
stockfish.postMessage('setoption name MultiPV value 3');
stockfish.postMessage('setoption name UCI_AnalyseMode value true');

stockfish.addEventListener('message', function (e) {
    if (e.data) {
        const data = e.data as string;

        if (data.startsWith(`info depth ${DEFAULT_DEPTH_STOCKFISH - 4}`) || data.startsWith(`info depth ${DEFAULT_DEPTH_STOCKFISH - 2}`) || data.startsWith(`info depth ${DEFAULT_DEPTH_STOCKFISH}`)) {
            const infoRegexp = /depth\s+(?<depthString>\d+)\s+seldepth\s+(?<seldepth>[\d]+)\s+multipv\s+(?<multipv>\d+)\s+score\s+(?<score>.+)\s+nodes.*\s+pv\s+(?<pv>.+)\s+bmc/;
            const { depthString, seldepth, multipv, score, pv } = data.match(infoRegexp)!.groups!;
            const depth = parseInt(depthString);

            console.log(data);
            const variationIndex = parseInt(multipv) - 1;
        
            const cp = parseInt(score.match(/\-?\d+/)![0]);
            
            useEngineStore().response.depth = depth;
            useEngineStore().response.variations[variationIndex] = {
                pv,
                score: cp,
                mate: score.includes('mate')
            };
        } else if (data.startsWith('Total evaluation')) {
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

            useBoardStore().stockfishDone();
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
        stockfish: {
            config: {
                elo: 3000, //from 100 to 3000
                depth: DEFAULT_DEPTH_STOCKFISH,
                skill: 20 //from 0 to 20
            },
            working: false,
            active: false
        },
        lc0: {
            config: {
                elo: 300,
                depth: DEFAULT_DEPTH_LC0,
                skill: 20 //from 0 to 20
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
        }
    },
    actions: {
        run(engine : ENGINE, fen: string) {
            this[engine].working = true;

            if (this[engine].config.skill < 20) {
                stockfish.postMessage(`setoption name Skill Level value ${this[engine].config.skill}`);
            }
            stockfish.postMessage(`position fen ${fen}`);
            stockfish.postMessage(`go depth ${this[engine].config.depth}`);
            stockfish.postMessage(`eval`);
        },
        setStockfishConfig(stockfishConfigPartial: StockfishConfigPartial) {
            this.stockfish.config = { ...this.stockfish.config, ...stockfishConfigPartial };
        }
    }
});