<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from 'vue-router';
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

const router = useRouter();
const route = useRoute();

const boardStore = useBoardStore();
const { generateReport, saveAnalysis, loadAnalysis } = boardStore;
const { options, movesLength, report, gameId } = storeToRefs(boardStore);

const activeKey = ref("analysis");

const handleSaveAnalysis = async () => {
    await saveAnalysis();
    router.replace({ path: `/analysis/game/${gameId.value}` });
};

onMounted(async () => {
    if (route.params.gameId) {
        await loadAnalysis(route.params.gameId as string);
    }
});

watch(() => route.params.gameId, async (gameId) => {
    await loadAnalysis(gameId as string);
});
</script>

<template>
    <a-row :gutter="10" wrap>
        <a-col>
            <Chessboard />
        </a-col>
        <a-col id="analysisColumn">
            <a-tabs v-if="!report.generation.active" v-model:activeKey="activeKey">
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
                            <a-button v-if="!route.params.gameId" type="dashed" @click="handleSaveAnalysis" block>Save</a-button>
                            <a-button type="dashed" @click="generateReport" block>Generate report</a-button>
                            <a-button type="dashed" @click="router.push({ name: 'saved-analysis' })" block>Saved analysis</a-button>
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
            <a-row v-else type="flex" justify="space-around" align="middle" :style="{ height: '100%' }">
                <a-col>
                    <a-space direction="vertical" align="center" size="middle">
                        <a-typography-title :level="3">Generating report...</a-typography-title>
                        <a-progress type="circle" :percent="report.generation.progress" />
                    </a-space>
                </a-col>
            </a-row>
        </a-col>
    </a-row>
</template>