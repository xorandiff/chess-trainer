<script setup lang="ts">
import { useBoardStore } from "@/stores/board";
const store = useBoardStore();
const { switchAlwaysStockfish, switchStockfish, setStockfishSkillLevel } = store;
const { stockfishSkillLevel } = store;
</script>

<template>
    <a-list bordered>
        <a-list-item>
            <a-row :style="{ width: '100%' }" :gutter="5">
                <a-col :span="20">
                    <a-input :value="store.fen">
                        <template #addonBefore>
                            FEN
                        </template>
                    </a-input>
                </a-col>
                <a-col :span="4">
                    <a-button>Load FEN</a-button>
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
            Stockfish Skill Level <a-slider :step="1" :min="1" :max="8" dots @afterChange="setStockfishSkillLevel" />
        </a-list-item>
    </a-list>
</template>