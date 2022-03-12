<script setup lang="ts">
import { useBoardStore } from "@/stores/board";
const store = useBoardStore();
const { switchAlwaysStockfish, switchStockfish, setStockfishSkillLevel, setStockfishMovetime, newGame } = store;
</script>

<template>
    <a-list bordered>
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
                <a-col :span="23">
                    <a-progress :percent="store.evalPercent" strokeLinecap="square" strokeColor="black" :showInfo="false" />
                </a-col>
                <a-col :span="1">
                    {{ store.eval }}
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
            <a-row :style="{ width: '100%' }" :gutter="10">
                <a-col :span="8">
                    Stockfish Skill Level <a-input-number v-model:value="store.stockfishSkillLevel" :step="1" :min="0" :max="20" @change="setStockfishSkillLevel" />
                </a-col>
                <a-col :span="8">
                    Stockfish Move Time 
                    <a-input-number v-model:value="store.stockfishMovetime" :step="10" :min="10" :max="5000" @change="setStockfishMovetime">
                        <template #addonAfter>
                            ms
                        </template>
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