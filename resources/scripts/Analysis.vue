<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from 'pinia';

import { useBoardStore } from "@/stores/board";
import { useEngineStore } from "@/stores/engine";

import Chessboard from "@/components/Chessboard.vue";
import Movelist from "@/components/Movelist.vue";
import OpeningCode from "@/components/OpeningCode.vue";
import EngineVariations from "@/components/EngineVariations.vue";
import Import from "@/components/Import.vue";
import Export from "@/components/Export.vue";
import PgnTags from "@/components/PgnTags.vue";
import MoveMark from "@/components/MoveMark.vue";

const boardStore = useBoardStore();
const engineStore = useEngineStore();
const { switchAlwaysStockfish, switchStockfish, generateReport } = boardStore;
const { setStockfishConfig } = engineStore;
const { stockfish, response } = storeToRefs(engineStore);
const { showFeedback, showVariations, lastMove, movesLength } = storeToRefs(boardStore);

const activeKey = ref("analysis");
const isLoading = ref(false);

const handleButtonClick = async () => {
    isLoading.value = true;
    await generateReport();
    isLoading.value = false;
}
</script>

<template>
    <a-row>
        <a-col>
            <Chessboard />
        </a-col>
        <a-col>
            <a-tabs v-model:activeKey="activeKey" :style="{ width: '500px' }">
                <a-tab-pane key="analysis">
                    <template #tab>
                        <span>
                            Analysis
                        </span>
                    </template>
                    <a-space direction="vertical" :style="{ width: '100%' }">
                        <template v-if="movesLength">
                            <MoveMark v-if="showFeedback && lastMove.mark" />
                            <EngineVariations v-if="showVariations" />
                            <OpeningCode />
                            <Movelist />
                        </template>
                        <template v-else>
                            <Import />
                        </template>
                        <!-- <a-button type="dashed" @click="handleButtonClick" :loading="isLoading">Generate report</a-button> -->
                    </a-space>
                </a-tab-pane>
                <a-tab-pane key="details">
                    <template #tab>
                        <span>
                            Details
                        </span>
                    </template>
                    <a-space direction="vertical" :style="{ width: '100%' }">
                        <PgnTags />
                    </a-space>
                </a-tab-pane>
                <a-tab-pane key="options">
                    <template #tab>
                        <span>
                            Options
                        </span>
                    </template>
                    <a-descriptions layout="vertical" :column="3" size="small" bordered>
                        <a-descriptions-item label="Show evaluation">
                            <a-switch :checked="boardStore.showEvaluation" @click="boardStore.$patch({ showEvaluation: !boardStore.showEvaluation })" />
                        </a-descriptions-item>
                        <a-descriptions-item label="Show variations">
                            <a-switch :checked="boardStore.showVariations" @click="boardStore.$patch({ showVariations: !boardStore.showVariations })" />
                        </a-descriptions-item>
                        <a-descriptions-item label="Show feedback">
                            <a-switch :checked="boardStore.showFeedback" @click="boardStore.$patch({ showFeedback: !boardStore.showFeedback })" />
                        </a-descriptions-item>
                        <a-descriptions-item label="Stockfish vs Stockfish">
                            <a-switch :checked="boardStore.alwaysStockfish" @click="switchAlwaysStockfish" />
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
                            {{ boardStore.alwaysStockfish || boardStore.stockfish ? response.depth : '-' }}
                        </a-descriptions-item>
                        <a-descriptions-item label="Actions" :span="3">
                            <a-space>
                                <Export />
                            </a-space>
                        </a-descriptions-item>
                    </a-descriptions>
                </a-tab-pane>
            </a-tabs>
        </a-col>
    </a-row>
</template>