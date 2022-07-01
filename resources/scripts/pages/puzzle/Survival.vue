<script setup lang="ts">
import { storeToRefs } from 'pinia';
import PuzzleDashboard from '@/components/puzzle/PuzzleDashboard.vue';

import { usePuzzleStore } from "@/stores/puzzle";

const puzzleStore = usePuzzleStore();

const { start } = puzzleStore;
const { active } = storeToRefs(puzzleStore);
</script>

<template>
    <a-row v-if="!active" type="flex" justify="space-around" align="middle" :style="{ height: '100%' }">
        <a-col>
            <a-space direction="vertical" size="middle" :style="{ width: '100%' }">
                <a-button size="large" @click="start(3)" block>3 min</a-button>
                <a-button size="large" @click="start(5)" block>5 min</a-button>
                <a-button size="large" @click="start" block>Unlimited</a-button>
            </a-space>
        </a-col>
    </a-row>
    <PuzzleDashboard v-else />
</template>