import { defineStore } from "pinia";
import axios from "axios";
import type { ENGINE } from '@/enums';

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
                depth: 15
            },
            working: false,
            active: false
        },
        lc0: {
            config: {
                elo: 300,
                depth: 15
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
        }
    },
    actions: {
        async run(engine : ENGINE, fen: string) {
            this[engine].working = true;
      
            try {
              const response = await axios.get(`/api/bestmove/${this[engine].config.depth}/${this[engine].config.elo}/${fen}`);
              const data : EngineResponse = response.data;

              this[engine].working = false;
      
              this.response.bestmove = data.bestmove;
              this.response.depth = data.depth;
              
              if (data.eval !== undefined) {
                this.response.eval = data.eval;
              }
      
              if (data.mate !== undefined) {
                this.response.mate = data.mate;
              }
      
            } catch (error) {
              console.log(error);
            }
        },
        setStockfishConfig(stockfishConfig: StockfishConfigPatch) {
            this.stockfish.config = { ...this.stockfish.config, ...stockfishConfig };
        }
    }
});