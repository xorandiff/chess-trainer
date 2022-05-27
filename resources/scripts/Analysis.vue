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
                            <MoveMark v-if="options.visibility.feedback" />
                            <EngineVariations v-if="options.visibility.variations" />
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