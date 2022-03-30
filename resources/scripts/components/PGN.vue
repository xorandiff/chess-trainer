<script setup lang="ts">
import { useBoardStore } from "@/stores/board";
const store = useBoardStore();
const { loadPGN } = store;
</script>

<template>
    <a-textarea id="pgn" v-model:value="store.pgn" />
    <a-button @click="loadPGN(store.pgn)">Load PGN</a-button>
</template>