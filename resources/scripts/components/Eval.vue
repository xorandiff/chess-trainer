<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useEngineStore } from "@/stores/engine";
const store = useEngineStore();
const { response } = storeToRefs(store);

defineProps<{
  size: number;
}>();
</script>

<template>
    <a-tooltip placement="left">
        <template #title>{{ store.evalTooltipText }}</template>
        <div id="evalContainer">
            <span :id="response.eval > 0 ? 'evalWhite' : 'evalBlack'">{{ store.evalDisplay }}</span>
            <div id="eval" :style="{ height: `${size}px` }">
                <div id="bar" :style="{ height: `${store.evalPercent}%` }"></div>
            </div>
        </div>
    </a-tooltip>
</template>