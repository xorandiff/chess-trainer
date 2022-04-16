import { defineStore } from "pinia";
import { useBoardStore } from "@/stores/board";
import type { ENGINE } from '@/enums';

let stockfish = new Worker('build/stockfish11.js');

stockfish.postMessage('ucinewgame');
stockfish.postMessage('setoption name MultiPV value 3');

stockfish.addEventListener('message', function (e) {
    if (e.data) {
        const data = e.data as string;
        console.log(data);

        if (data.startsWith('info')) {
            const infoRegexp = /depth\s+(?<depth>\d+)\s+seldepth\s+(?<seldepth>\d+)\s+multipv\s+(?<multipv>\d+)\s+score\s+(?<score>.+)\s+nodes.*\s+pv\s+(?<pv>.+)\s+bmc/;
            const { depth, seldepth, multipv, score, pv } = data.match(infoRegexp)!.groups!;
            const variationIndex = parseInt(multipv) - 1;

            if (score.includes('mate')) {
                const { mate } = score.match(/(?<mate>\-?\d+)/)!.groups!;
                useEngineStore().response.mate = parseInt(mate);
            }
            
            useEngineStore().response.depth = parseFloat(depth);
            useEngineStore().response.variations[variationIndex] = pv;
        } else if (data.startsWith('Total evaluation')) {
            const evalRegexp = /\s+(?<evaluation>[\-\.\d]+)\s+/;
            const { evaluation } = data.match(evalRegexp)!.groups!;

            useEngineStore().response.eval = parseFloat(evaluation);
        } else if (data.startsWith('bestmove')) {
            const bestmoveRegexp = /bestmove\s+(?<bestmove>.+)\s+ponder\s+(?<ponder>.+)/;
            const { bestmove, ponder } = data.match(bestmoveRegexp)!.groups!;

            useEngineStore().response.bestmove = bestmove;

            const board = useBoardStore();
            board.stockfishDone();
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
            variations: [] as string[]
        },
        stockfish: {
            config: {
                elo: 300, //from 100 to 3000
                depth: 12,
                skill: 20 //from 0 to 20
            },
            working: false,
            active: false
        },
        lc0: {
            config: {
                elo: 300,
                depth: 21,
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

            stockfish.postMessage(`setoption name Skill Level value ${this[engine].config.skill}`);
            stockfish.postMessage(`position fen ${fen}`);
            stockfish.postMessage(`go depth ${this[engine].config.depth}`);
            stockfish.postMessage(`eval`);
        },
        setStockfishConfig(stockfishConfig: StockfishConfigPatch) {
            this.stockfish.config = { ...this.stockfish.config, ...stockfishConfig };
        }
    }
});