<script setup lang="ts">
import { ref, onMounted } from "vue";
import { FileSearchOutlined, FolderOpenOutlined, HistoryOutlined } from '@ant-design/icons-vue';

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
const loadingAnalysis = ref(false);
const loadingPreviousAnalysis = ref(false);
const loadingSaveAnalysis = ref(false);

const handleSaveAnalysis = async () => {
    loadingSaveAnalysis.value = true;

    await saveAnalysis();
    router.replace({ path: `/analysis/game/${gameId.value}` });

    loadingSaveAnalysis.value = false;
};

const handleLoadPreviousAnalysis = async () => {
    loadingPreviousAnalysis.value = true;

    await loadAnalysis();
    router.replace({ path: `/analysis/game/${gameId.value}` });

    loadingPreviousAnalysis.value = false;
}

onMounted(async () => {
    if (route.params.gameId) {
        loadingAnalysis.value = true;

        await loadAnalysis(route.params.gameId as string);

        loadingAnalysis.value = false;
    } else {
        router.push({ name: 'analysis' });
    }
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
                            <a-button 
                                v-if="!route.params.gameId" 
                                type="dashed" 
                                @click="handleSaveAnalysis" 
                                block
                            >
                                Save
                            </a-button>
                            <a-button 
                                type="dashed" 
                                @click="generateReport"
                                :style="{ marginTop: '30%' }" 
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
                        </template>
                        <template v-else>
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