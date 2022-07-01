<script setup lang="ts">
import { UserOutlined, FlagOutlined, LeftOutlined, RightOutlined, CheckSquareFilled, CloseSquareFilled, InfoCircleTwoTone } from '@ant-design/icons-vue';
import { storeToRefs } from 'pinia';

import { PIECE_COLOR } from "@/enums";
import PuzzleCompletedModal from '@/components/puzzle/PuzzleCompletedModal.vue';

import { usePuzzleStore } from "@/stores/puzzle";

const puzzleStore = usePuzzleStore();
const { solvedCount, color, finished } = storeToRefs(puzzleStore);
</script>

<template>
    <a-row id="puzzleDashboard" type="flex" justify="space-around" align="top">
        <a-col :style="{ width: '100%', height: '100%' }">
            <a-card :style="{ width: '100%', height: '100%' }">
                <template #cover>
                    <div :class="['playingColor', color === PIECE_COLOR.WHITE ? 'white' : 'black']">
                        <info-circle-two-tone :two-tone-color="color === PIECE_COLOR.WHITE ? '#dad8d6' : '#312e2b'" class="icon" /> 
                        <span class="title">
                            {{ color === PIECE_COLOR.WHITE ? 'White' : 'Black' }} to Move
                        </span>
                    </div>
                </template>
                <a-space direction="vertical" align="center" size="large" :style="{ width: '100%' }">
                    <a-avatar shape="square" :size="100" style="margin-top: 1rem">
                        <template #icon><user-outlined /></template>
                    </a-avatar>

                    <span class="solvedCount">{{ solvedCount > 0 ? solvedCount : '--' }}</span>

                    <a-space align="start" size="middle" :style="{ width: '32rem' }">
                        <div v-for="finishedPuzzle in finished" class="puzzleInfo">
                            <a-space direction="vertical" align="center" :size="2">
                                <check-square-filled v-if="finishedPuzzle.solved" class="icon" style="color: #6c9d41;" />
                                <close-square-filled v-else class="icon" style="color: #b23330" />
                                <span class="rating" :style="{ color: finishedPuzzle.solved ? '#6c9d41' : '#b23330' }">
                                    {{ finishedPuzzle.rating }}
                                </span>
                            </a-space>
                        </div>
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
    <PuzzleCompletedModal />
</template>