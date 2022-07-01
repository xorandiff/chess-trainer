<script setup lang="ts">
import { onMounted } from "vue";

import { useBoardStore } from "@/stores/board";
import { usePuzzleStore } from "@/stores/puzzle";
import Chessboard from "@/components/Chessboard.vue";

const boardStore = useBoardStore();
const puzzleStore = usePuzzleStore();

onMounted(() => {
    boardStore.$reset();
    puzzleStore.$reset();
});
</script>

<template>
    <a-row :gutter="10">
        <a-col>
            <Chessboard />
        </a-col>
        <a-col id="analysisColumn">
            <router-view></router-view>
        </a-col>
    </a-row>
</template>