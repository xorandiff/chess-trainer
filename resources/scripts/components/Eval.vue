<script setup lang="ts">
import { useBoardStore } from "@/stores/board";
const store = useBoardStore();
</script>

<template>
    <a-typography-text>{{ store.stockfishMateIn ? `M${store.stockfishMateIn}` : store.eval }}</a-typography-text>
    <a-progress :style="{ transform: 'rotate(90deg)', transformOrigin: 'left center', width: '550px', marginLeft: '7px' }" :percent="store.evalPercent" strokeLinecap="square" strokeColor="black" :showInfo="false" />
</template>