<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useBoardStore } from "@/stores/board";
import { useEngineStore } from "@/stores/engine";
const boardStore = useBoardStore();
const engineStore = useEngineStore();
const { switchAlwaysStockfish, switchStockfish, newGame } = boardStore;
const { setStockfishConfig } = engineStore;
const { stockfish, response } = storeToRefs(engineStore);
</script>

<template>
    <a-list bordered>
        <a-list-item>
            ECO {{ boardStore.eco ? boardStore.eco : '-' }}
        </a-list-item>
        <a-list-item>
            <a-row :style="{ width: '100%' }" :gutter="5">
                <a-col :span="20">
                    <a-input v-model:value="boardStore.fen">
                        <template #addonBefore>
                            FEN
                        </template>
                    </a-input>
                </a-col>
                <a-col :span="4">
                    <a-button @click="newGame(boardStore.fen)">Load FEN</a-button>
                </a-col>
            </a-row>
        </a-list-item>
        <a-list-item>
            <a-row :style="{ width: '100%' }" :gutter="10">
                <a-col :span="12">
                    Stockfish playing both sides <a-switch :checked="boardStore.alwaysStockfish" @click="switchAlwaysStockfish" />
                </a-col>
                <a-col :span="12">
                    Stockfish playing black <a-switch :checked="boardStore.stockfish" @click="switchStockfish" />
                </a-col>
            </a-row>
        </a-list-item>
        <a-list-item>
            <a-row :style="{ width: '100%' }" :gutter="5">
                <a-col :span="6">
                    Stockfish ELO <a-input-number v-model:value="stockfish.config.elo" :step="100" :min="100" :max="3000" @change="(value: number) => setStockfishConfig({ elo: value })" />
                </a-col>
                <a-col :span="10">
                    Stockfish desired depth 
                    <a-input-number v-model:value="stockfish.config.depth" :step="1" :min="1" :max="35" @change="(value: number) => setStockfishConfig({ depth: value })">
                    </a-input-number>
                </a-col>
                <a-col :span="8">
                    <template v-if="boardStore.alwaysStockfish || boardStore.stockfish">
                        Stockfish Depth {{ response.depth }}
                    </template>
                </a-col>
            </a-row>
        </a-list-item>
    </a-list>
</template>