<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useEngineStore } from "@/stores/engine";
const store = useEngineStore();
const { response, evalFormat, evalPercent } = storeToRefs(store);
</script>

<template>
    <a-tooltip placement="left">
        <template #title>{{ evalFormat(false, true, false) }}</template>
        <div id="evalContainer">
            <span :id="response.eval > 0 ? 'evalWhite' : 'evalBlack'">{{ evalFormat(true, false, true) }}</span>
            <div id="eval">
                <div id="bar" :style="{ height: `${evalPercent}%` }"></div>
            </div>
        </div>
    </a-tooltip>
</template>