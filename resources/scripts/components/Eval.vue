<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useEngineStore } from "@/stores/engine";
const store = useEngineStore();
const { response } = storeToRefs(store);
</script>

<template>
    <a-typography-text>{{ response.mate ? `M${response.mate}` : response.eval }}</a-typography-text>
    <a-progress :style="{ transform: 'rotate(90deg)', transformOrigin: 'left center', width: '550px', marginLeft: '7px' }" :percent="store.evalPercent" strokeLinecap="square" strokeColor="black" :showInfo="false" />
</template>