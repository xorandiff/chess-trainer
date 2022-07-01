<script setup lang="ts">
import { onMounted } from "vue";
import Chessboard from "@/components/Chessboard.vue";
import { useBoardStore } from "@/stores/board";

const boardStore = useBoardStore();

onMounted(() => {
    boardStore.$reset();
});
</script>

<template>
    <a-row :gutter="10">
        <a-col>
            <Chessboard />
        </a-col>
        <a-col id="analysisColumn">
            
        </a-col>
    </a-row>
</template>