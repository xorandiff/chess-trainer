<script setup lang="ts">
import { useBoardStore } from "@/stores/board";
const store = useBoardStore();
const { switchAlwaysStockfish, switchStockfish, setStockfishElo, setStockfishDesiredDepth, newGame } = store;
</script>

<template>
    <a-list bordered>
        <a-list-item>
            ECO {{ store.eco ? store.eco : '-' }}
        </a-list-item>
        <a-list-item>
            <a-row :style="{ width: '100%' }" :gutter="5">
                <a-col :span="20">
                    <a-input v-model:value="store.fen">
                        <template #addonBefore>
                            FEN
                        </template>
                    </a-input>
                </a-col>
                <a-col :span="4">
                    <a-button @click="newGame(store.fen)">Load FEN</a-button>
                </a-col>
            </a-row>
        </a-list-item>
        <a-list-item>
            <a-row :style="{ width: '100%' }" :gutter="10">
                <a-col :span="12">
                    Stockfish playing both sides <a-switch :checked="store.alwaysStockfish" @click="switchAlwaysStockfish" />
                </a-col>
                <a-col :span="12">
                    Stockfish playing black <a-switch :checked="store.stockfish" @click="switchStockfish" />
                </a-col>
            </a-row>
        </a-list-item>
        <a-list-item>
            <a-row :style="{ width: '100%' }" :gutter="5">
                <a-col :span="6">
                    Stockfish ELO <a-input-number v-model:value="store.stockfishElo" :step="100" :min="100" :max="3000" @change="setStockfishElo" />
                </a-col>
                <a-col :span="10">
                    Stockfish desired depth 
                    <a-input-number v-model:value="store.stockfishDesiredDepth" :step="1" :min="1" :max="35" @change="setStockfishDesiredDepth">
                    </a-input-number>
                </a-col>
                <a-col :span="8">
                    <template v-if="store.alwaysStockfish || store.stockfish">
                        Stockfish Depth {{ store.stockfishDepth }}
                    </template>
                </a-col>
            </a-row>
        </a-list-item>
    </a-list>
</template>