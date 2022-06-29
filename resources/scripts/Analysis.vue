<script setup lang="ts">
import { ref, onMounted } from "vue";
import { FileSearchOutlined, FolderOpenOutlined, HistoryOutlined } from '@ant-design/icons-vue';

import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useBoardStore } from "@/stores/board";

import Chessboard from "@/components/Chessboard.vue";
import Movelist from "@/components/Movelist.vue";
import MoveMark from "@/components/MoveMark.vue";
import ReportSummary from "@/components/ReportSummary.vue";
import OpeningCode from "@/components/OpeningCode.vue";
import EngineVariations from "@/components/EngineVariations.vue";
import BoardOptions from "@/components/BoardOptions.vue";
import PgnTags from "@/components/PgnTags.vue";
import Import from "@/components/Import.vue";

const router = useRouter();
const route = useRoute();

const boardStore = useBoardStore();
const { updatePgnTags, generateReport, saveAnalysis, updateAnalysis, loadAnalysis } = boardStore;
const { options, movesLength, report, gameId, pgn } = storeToRefs(boardStore);

const activeKey = ref("analysis");
const loadingAnalysis = ref(false);
const loadingPreviousAnalysis = ref(false);
const loadingSaveAnalysis = ref(false);

const handleSaveAnalysis = async () => {
    loadingSaveAnalysis.value = true;

    if (gameId.value && pgn.value.current != pgn.value.saved) {
        await updateAnalysis();
    } else {
        await saveAnalysis();
        router.replace({ path: `/analysis/game/${gameId.value}` });
    }

    loadingSaveAnalysis.value = false;
};

const handleLoadPreviousAnalysis = async () => {
    loadingPreviousAnalysis.value = true;

    await loadAnalysis();
    router.replace({ path: `/analysis/game/${gameId.value}` });

    loadingPreviousAnalysis.value = false;
};

const handleGenerateReport = () => {
    generateReport();
    activeKey.value = 'report';
};

const handleTabChange = (activeKey: string) => {
    if (activeKey == 'analysis') {
        updatePgnTags();
    }
};

onMounted(async () => {
    if (route.params.gameId) {
        loadingAnalysis.value = true;

        await loadAnalysis(route.params.gameId as string);

        loadingAnalysis.value = false;
    } else {
        boardStore.$reset();
    }
});
</script>

<template>
    <a-row :gutter="10" wrap>
        <a-col>
            <Chessboard />
        </a-col>
        <a-col id="analysisColumn">
            <a-tabs v-model:activeKey="activeKey" @change="handleTabChange" style="height: 100%">
                <a-tab-pane key="report" v-if="report.enabled">
                    <template #tab>
                        <span>
                            Report
                        </span>
                    </template>
                    <template v-if="!report.generation.active">
                        <a-space direction="vertical" :style="{ width: '100%' }">
                            <ReportSummary />
                            <MoveMark v-if="options.visibility.feedback" />
                            <Movelist />
                        </a-space>
                    </template>
                    <a-row v-else type="flex" justify="space-around" align="middle" :style="{ height: '100%' }">
                        <a-col>
                            <a-space direction="vertical" align="center" size="middle">
                                <a-typography-title :level="3">Generating report...</a-typography-title>
                                <a-progress type="circle" :percent="report.generation.progress" />
                            </a-space>
                        </a-col>
                    </a-row>
                </a-tab-pane>
                <a-tab-pane key="analysis">
                    <template #tab>
                        <span>
                            Analysis
                        </span>
                    </template>
                    <template v-if="movesLength">
                        <a-space direction="vertical" :style="{ width: '100%' }">
                            <MoveMark v-if="options.visibility.feedback" />
                            <EngineVariations v-if="options.visibility.variations" />
                            <OpeningCode />
                            <Movelist />
                            <a-button 
                                type="dashed" 
                                @click="handleSaveAnalysis" 
                                block
                                :disabled="pgn.current == pgn.saved"
                            >
                                {{ pgn.current != pgn.saved ? 'Save' : 'Saved' }}
                            </a-button>
                        </a-space>
                        <a-space direction="vertical" :style="{ width: '100%', bottom: '0px', position: 'absolute', left: '0px' }">
                            <a-button 
                                v-if="!report.enabled"
                                type="dashed" 
                                @click="handleGenerateReport"
                                block
                            >
                                <template #icon>
                                    <FileSearchOutlined />
                                </template>
                                Generate report
                            </a-button>
                            <a-button 
                                type="dashed" 
                                @click="router.push({ name: 'saved-analysis' })" 
                                :loading="loadingSaveAnalysis" 
                                :disabled="loadingPreviousAnalysis"
                                block
                            >
                                <template #icon>
                                    <FolderOpenOutlined />
                                </template>
                                Saved analysis
                            </a-button>
                        </a-space>
                    </template>
                    <template v-else>
                        <a-space direction="vertical" :style="{ width: '100%' }">
                            <Import />
                            <a-button 
                                @click="handleLoadPreviousAnalysis" 
                                :loading="loadingPreviousAnalysis" 
                                :disabled="loadingSaveAnalysis"
                                block
                            >
                                <template #icon>
                                    <HistoryOutlined />
                                </template>
                                Load previous analysis
                            </a-button>
                        </a-space>
                    </template>
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