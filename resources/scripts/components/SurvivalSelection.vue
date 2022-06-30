<script setup lang="ts">
import { UserOutlined, FlagOutlined, LeftOutlined, RightOutlined, CheckSquareFilled, CheckSquareOutlined, CloseSquareFilled, CalendarOutlined, SyncOutlined, FireOutlined, ClockCircleOutlined } from '@ant-design/icons-vue';
import { storeToRefs } from 'pinia';
import { PIECE_COLOR } from "@/enums";

import { usePuzzleStore } from "@/stores/puzzle";

const puzzleStore = usePuzzleStore();

const { start } = puzzleStore;
const { active, solvedCount, color, finished, completed, highestSolved, longestStreak } = storeToRefs(puzzleStore);

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
                                    <check-square-filled v-if="finishedPuzzle.solved" class="puzzleIcon" style="color: #6c9d41;" />
                                    <close-square-filled v-else class="puzzleIcon" style="color: #b23330" />
                                </div>
                                <div class="rating" :style="{ color: finishedPuzzle.solved ? '#6c9d41' : '#b23330' }">
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
    <a-modal 
        v-model:visible="completed" 
        title="Completed" 
        :footer="null" 
        :mask="false"
        :maskClosable="false"
    >
        <a-row type="flex" justify="space-around" align="top" :style="{ height: '100%' }">
            <a-col :style="{ width: '100%' }">
                <a-space direction="vertical" align="center" size="large" :style="{ width: '100%' }">
                    <a-avatar shape="square" :size="100">
                        <template #icon><user-outlined /></template>
                    </a-avatar>
                    <a-typography-title>{{ solvedCount > 0 ? solvedCount : '--' }}</a-typography-title>
                    <a-row type="flex" justify="space-around" style="width: 300px">
                        <a-col>
                            <a-statistic :value="5" prefix="#" :valueStyle="{ textAlign: 'center' }">
                                <template #title>
                                    <a-space direction="vertical" align="center" :size="2">
                                        <calendar-outlined style="font-size: 1.2rem" />
                                        <span>Today</span>
                                    </a-space>
                                </template>
                            </a-statistic>
                        </a-col>
                        <a-col>
                            <a-statistic :value="5" prefix="#" :valueStyle="{ textAlign: 'center' }">
                                <template #title>
                                    <a-space direction="vertical" align="center" :size="2">
                                        <calendar-outlined style="font-size: 1.2rem" />
                                        <span>This week</span>
                                    </a-space>
                                </template>
                            </a-statistic>
                        </a-col>
                        <a-col>
                            <a-statistic :value="5" prefix="#" :valueStyle="{ textAlign: 'center' }">
                                <template #title>
                                    <a-space direction="vertical" align="center" :size="2">
                                        <sync-outlined style="font-size: 1.2rem" />
                                        <span>All time</span>
                                    </a-space>
                                </template>
                            </a-statistic>
                        </a-col>
                    </a-row>
                    <a-list style="width: 400px">
                        <a-list-item>
                            <a-row style="width: 100%">
                                <a-col :span="12" style="text-align: left">
                                    <fire-outlined /> Longest Streak
                                </a-col>
                                <a-col :span="12" style="text-align: right">
                                    {{ longestStreak }}
                                </a-col>
                            </a-row>
                        </a-list-item>
                        <a-list-item>
                            <a-row style="width: 100%">
                                <a-col :span="12" style="text-align: left">
                                    <check-square-outlined /> Highest Solved
                                </a-col>
                                <a-col :span="12" style="text-align: right">
                                    {{ highestSolved ? highestSolved.rating : '--' }}
                                </a-col>
                            </a-row>
                        </a-list-item>
                        <a-list-item>
                            <a-row style="width: 100%">
                                <a-col :span="12" style="text-align: left">
                                    <clock-circle-outlined /> Avg Time per Puzzle
                                </a-col>
                                <a-col :span="12" style="text-align: right">
                                    0:00
                                </a-col>
                            </a-row>
                        </a-list-item>
                    </a-list>
                </a-space>
            </a-col>
        </a-row>
    </a-modal>
</template>