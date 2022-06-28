<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { MOVE_MARK } from "@/enums";
import { useBoardStore } from "@/stores/board";

import BookIcon from "@/components/icons/BookIcon.vue";
import BrilliantMoveIcon from "@/components/icons/BrilliantMoveIcon.vue";
import GreatMoveIcon from "@/components/icons/GreatMoveIcon.vue";
import BestMoveIcon from "@/components/icons/BestMoveIcon.vue";
import ExcellentMoveIcon from "@/components/icons/ExcellentMoveIcon.vue";
import GoodMoveIcon from "@/components/icons/GoodMoveIcon.vue";
import InaccuracyIcon from "@/components/icons/InaccuracyIcon.vue";
import MistakeIcon from "@/components/icons/MistakeIcon.vue";
import BlunderIcon from "@/components/icons/BlunderIcon.vue";

const store = useBoardStore();

const { currentMove } = storeToRefs(store);
</script>

<template>
    <a-descriptions class="moveMarkDescription" v-if="currentMove && currentMove.mark" :column="1" size="small" bordered>
        <a-descriptions-item>
            <a-typography-title :level="4">
                <span v-if="currentMove.mark == MOVE_MARK.BOOK" :style="{ color: '#a88865' }">
                   <BookIcon :size="26" /> {{ currentMove.algebraicNotation }} is a book move
                </span>
                <span v-if="currentMove.mark == MOVE_MARK.BRILLIANT" :style="{ color: '#1baca6' }">
                   <BrilliantMoveIcon :size="26" /> {{ currentMove.algebraicNotation }} is brilliant
                </span>
                <span v-if="currentMove.mark == MOVE_MARK.GREAT_MOVE" :style="{ color: '#5c8bb0' }">
                   <GreatMoveIcon :size="26" /> {{ currentMove.algebraicNotation }} is a great move
                </span>
                <span v-if="currentMove.mark == MOVE_MARK.BEST_MOVE" :style="{ color: '#96bc4b' }">
                   <BestMoveIcon :size="26" /> {{ currentMove.algebraicNotation }} is best
                </span>
                <span v-if="currentMove.mark == MOVE_MARK.EXCELLENT" :style="{ color: '#96bc4b' }">
                   <ExcellentMoveIcon :size="26" /> {{ currentMove.algebraicNotation }} is excellent
                </span>
                <span v-if="currentMove.mark == MOVE_MARK.GOOD" :style="{ color: '#96af8b' }">
                   <GoodMoveIcon :size="26" /> {{ currentMove.algebraicNotation }} is good
                </span>
                <span v-if="currentMove.mark == MOVE_MARK.INACCURACY" :style="{ color: '#f0c15c' }">
                   <InaccuracyIcon :size="26" /> {{ currentMove.algebraicNotation }} is an inaccuracy
                </span>
                <span v-if="currentMove.mark == MOVE_MARK.MISTAKE" :style="{ color: '#e58f2a' }">
                   <MistakeIcon :size="26" /> {{ currentMove.algebraicNotation }} is a mistake
                </span>
                <span v-if="currentMove.mark == MOVE_MARK.BLUNDER" :style="{ color: '#ca3431' }">
                   <BlunderIcon :size="26" /> {{ currentMove.algebraicNotation }} is a blunder
                </span>
            </a-typography-title>
        </a-descriptions-item>
    </a-descriptions>
</template>