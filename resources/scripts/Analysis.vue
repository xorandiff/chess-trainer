<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from 'pinia';

import { useBoardStore } from "@/stores/board";
import { useEngineStore } from "@/stores/engine";

import Chessboard from "./components/Chessboard.vue";
import Movelist from "./components/Movelist.vue";
import OpeningCode from "./components/OpeningCode.vue";
import EngineVariations from "@/components/EngineVariations.vue";
import Import from "@/components/Import.vue";
import Export from "@/components/Export.vue";
import PgnTags from "@/components/PgnTags.vue";

const boardStore = useBoardStore();
const engineStore = useEngineStore();
const { switchAlwaysStockfish, switchStockfish } = boardStore;
const { setStockfishConfig } = engineStore;
const { stockfish, response } = storeToRefs(engineStore);

const activeKey = ref("analysis");
</script>

<template>
    <a-row type="flex">
        <a-col flex="auto">
            <Chessboard :size="650" />
        </a-col>
        <a-col flex="580px">
            <a-tabs v-model:activeKey="activeKey">
                <a-tab-pane key="analysis">
                    <template #tab>
                        <span>
                            Analysis
                        </span>
                    </template>
                    <a-space direction="vertical" :style="{ width: '100%' }">
                        <EngineVariations />
                        <OpeningCode />
                        <Movelist />
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
                    <a-descriptions layout="vertical" :column="2" size="small" bordered>
                        <a-descriptions-item label="Stockfish playing both sides">
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
                        <a-descriptions-item>
                            <a-space>
                                <Import />
                                <Export />
                            </a-space>
                        </a-descriptions-item>
                    </a-descriptions>
                </a-tab-pane>
            </a-tabs>
        </a-col>
    </a-row>
</template>