<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useBoardStore } from "@/stores/board";
import { useEngineStore } from "@/stores/engine";
import Export from "@/components/Export.vue";

const boardStore = useBoardStore();
const engineStore = useEngineStore();

const { switchAlwaysStockfish, switchStockfish, toggleEvaluation, toggleVariations, toggleFeedback } = boardStore;
const { options, alwaysStockfish } = storeToRefs(boardStore);

const { setStockfishConfig } = engineStore;
const { stockfish, response } = storeToRefs(engineStore);

</script>

<template>
    <a-descriptions layout="vertical" :column="3" size="small" bordered>
        <a-descriptions-item label="Show evaluation">
            <a-switch :checked="options.visibility.evaluation" @click="toggleEvaluation" />
        </a-descriptions-item>
        <a-descriptions-item label="Show variations">
            <a-switch :checked="options.visibility.variations" @click="toggleVariations" />
        </a-descriptions-item>
        <a-descriptions-item label="Show feedback">
            <a-switch :checked="options.visibility.feedback" @click="toggleFeedback" />
        </a-descriptions-item>
        <a-descriptions-item label="Stockfish vs Stockfish">
            <a-switch :checked="alwaysStockfish" @click="switchAlwaysStockfish" />
        </a-descriptions-item>
        <a-descriptions-item label="Stockfish playing black">
            <a-switch :checked="boardStore.stockfish" @click="switchStockfish" />
        </a-descriptions-item>
        <a-descriptions-item label="Stockfish Skill Level">
            <a-input-number v-model:value="stockfish.config.skill" :step="1" :min="0" :max="20" @change="(value: number) => setStockfishConfig({ skill: value })" />
        </a-descriptions-item>
        <a-descriptions-item label="Stockfish desired depth">
            <a-input-number v-model:value="stockfish.config.depth" :step="1" :min="1" :max="35" @change="(value: number) => setStockfishConfig({ depth: value })">
            </a-input-number>
        </a-descriptions-item>
        <a-descriptions-item label="Stockfish Depth" :span="2">
            {{ alwaysStockfish || boardStore.stockfish ? response.depth : '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="Actions" :span="3">
            <a-space>
                <Export />
            </a-space>
        </a-descriptions-item>
    </a-descriptions>
</template>