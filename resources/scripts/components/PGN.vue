<script setup lang="ts">
import { useBoardStore } from "@/stores/board";
const store = useBoardStore();
const { loadPGN } = store;
</script>

<template>
    <a-textarea v-model:value="store.pgn" :style="{ height: '230px', marginBottom: '15px' }" />
    <a-button @click="loadPGN(store.pgn)">Load PGN</a-button>
</template>