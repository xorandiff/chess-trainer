<script setup lang="ts">
import { UserOutlined, FlagOutlined, LeftOutlined, RightOutlined, CheckSquareTwoTone, CloseSquareTwoTone } from '@ant-design/icons-vue';
import { storeToRefs } from 'pinia';
import { PIECE_COLOR } from "@/enums";

import { usePuzzleStore } from "@/stores/puzzle";

const puzzleStore = usePuzzleStore();

const { start } = puzzleStore;
const { active, solvedCount, color, finished } = storeToRefs(puzzleStore);
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
    <a-row v-else type="flex" justify="space-around" align="top" :style="{ height: '100%' }">
        <a-col :style="{ width: '100%' }">
            <a-card :title="`${color === PIECE_COLOR.WHITE ? 'White' : 'Black'} to move`" :style="{ width: '100%' }">
                <a-space direction="vertical" align="center" size="large" :style="{ width: '100%' }">
                    <a-avatar shape="square" :size="100">
                        <template #icon><user-outlined /></template>
                    </a-avatar>
                    <a-typography-title>{{ solvedCount > 0 ? solvedCount : '--' }}</a-typography-title>
                    <a-space>
                        <template v-for="finishedPuzzle in finished">
                            <div class="puzzleInfo">
                                <div class="icon">
                                    <check-square-two-tone v-if="finishedPuzzle.solved" class="puzzleIcon" two-tone-color="green" />
                                    <close-square-two-tone v-else class="puzzleIcon" two-tone-color="red" />
                                </div>
                                <div class="rating" :style="{ color: finishedPuzzle.solved ? 'green' : 'red' }">
                                    {{ finishedPuzzle.rating }}
                                </div>
                            </div>
                        </template>
                    </a-space>
                </a-space>
                <template #actions>
                    <flag-outlined key="quit" />
                    <left-outlined key="previous" />
                    <right-outlined key="next" />
                </template>
            </a-card>
        </a-col>
    </a-row>
</template>