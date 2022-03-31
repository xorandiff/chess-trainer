<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useEngineStore } from "@/stores/engine";
const store = useEngineStore();
const { response } = storeToRefs(store);
</script>

<template>
    <a-typography-text>{{ response.mate ? `M${response.mate}` : response.eval }}</a-typography-text>
    <a-progress 
        id="eval"
        :percent="store.evalPercent" 
        strokeLinecap="square" 
        strokeColor="#403d39" 
        trailColor="white" 
        strokeWidth="20" 
        :showInfo="false" 
    />
</template>