import { defineStore } from "pinia";
import { useBoardStore } from "@/stores/board";
import type { ENGINE } from '@/enums';

let stockfish = new Worker('build/stockfish11.js');

stockfish.addEventListener('message', function (e) {
    if (e.data) {
        const data = e.data as string;

        if (data.startsWith('info')) {
            const infoRegexp = /depth\s+(?<depth>\d+)\s+seldepth\s+(?<seldepth>\d+)\s+.*score\s+(?<score>.+)\s+nodes.*\s+pv\s+(?<pv>.+)\s+bmc/;
            const { depth, seldepth, score, pv } = data.match(infoRegexp)!.groups!;

            if (score.includes('mate')) {
                const { mate } = score.match(/(?<mate>\-?\d+)/)!.groups!;
                useEngineStore().response.mate = parseInt(mate);
            }
            
            useEngineStore().response.depth = parseFloat(depth);
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
            eval: 0
        },
        stockfish: {
            config: {
                elo: 300, //from 100 to 3000
                depth: 21,
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
        evalDisplay: (state) => {
            const evalAbs = Math.abs(state.response.eval);
            const roundFactor = evalAbs >= 10 ? 1 : 10;
            const evalRoundedAbs = Math.round(evalAbs * roundFactor) / roundFactor;
            return state.response.mate ? `M${Math.abs(state.response.mate)}` : evalRoundedAbs;
        },
        evalTooltipText: (state) => {
            let evalTooltipText = `${state.response.eval}`;
            if (state.response.eval > 0) {
                evalTooltipText = `+${evalTooltipText}`;
            }
            return evalTooltipText;
        }
    },
    actions: {
        async run(engine : ENGINE, fen: string) {
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