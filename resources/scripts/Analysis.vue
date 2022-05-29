<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from 'pinia';

import { useBoardStore } from "@/stores/board";

import Chessboard from "@/components/Chessboard.vue";
import Movelist from "@/components/Movelist.vue";
import MoveMark from "@/components/MoveMark.vue";
import OpeningCode from "@/components/OpeningCode.vue";
import EngineVariations from "@/components/EngineVariations.vue";
import BoardOptions from "@/components/BoardOptions.vue";
import PgnTags from "@/components/PgnTags.vue";
import Import from "@/components/Import.vue";

const boardStore = useBoardStore();
const { generateReport } = boardStore;
const { options, movesLength } = storeToRefs(boardStore);

const activeKey = ref("analysis");
</script>

<template>
    <a-row :gutter="10" wrap>
        <a-col>
            <Chessboard />
        </a-col>
        <a-col id="analysisColumn">
            <a-tabs v-model:activeKey="activeKey">
                <a-tab-pane key="analysis">
                    <template #tab>
                        <span>
                            Analysis
                        </span>
                    </template>
                    <a-space direction="vertical">
                        <template v-if="movesLength">
                            <MoveMark v-if="options.visibility.feedback" />
                            <EngineVariations v-if="options.visibility.variations" />
                            <OpeningCode />
                            <Movelist />
                            <a-button type="dashed" @click="generateReport" block>Generate report</a-button>
                        </template>
                        <template v-else>
                            <Import />
                        </template>
                    </a-space>
                </a-tab-pane>
                <a-tab-pane key="details">
                    <template #tab>
                        <span>
                            Details
                        </span>
                    </template>
                    <PgnTags />
                </a-tab-pane>
                <a-tab-pane key="options">
                    <template #tab>
                        <span>
                            Options
                        </span>
                    </template>
                    <BoardOptions />
                </a-tab-pane>
            </a-tabs>
        </a-col>
    </a-row>
</template>