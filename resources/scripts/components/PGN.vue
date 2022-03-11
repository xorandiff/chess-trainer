<script setup lang="ts">
import { useBoardStore } from "@/stores/board";
const store = useBoardStore();
</script>

<template>
    <a-textarea v-model:value="store.pgn" />
</template>