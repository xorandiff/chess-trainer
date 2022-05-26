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

const { lastMove } = storeToRefs(store);
</script>

<template>
    <a-descriptions class="moveMarkDescription" v-if="lastMove.mark" :column="1" size="small" bordered>
        <a-descriptions-item>
            <a-typography-title :level="4">
                <span v-if="lastMove.mark == MOVE_MARK.BOOK" :style="{ color: '#a88865' }">
                   <BookIcon/> {{ lastMove.piece.type != 'p' ? lastMove.piece.type.toUpperCase() + lastMove.algebraicNotation : lastMove.algebraicNotation }} is a book move
                </span>
                <span v-if="lastMove.mark == MOVE_MARK.BRILLIANT" :style="{ color: '#1baca6' }">
                   <BrilliantMoveIcon/> {{ lastMove.piece.type != 'p' ? lastMove.piece.type.toUpperCase() + lastMove.algebraicNotation : lastMove.algebraicNotation }} is brilliant
                </span>
                <span v-if="lastMove.mark == MOVE_MARK.GREAT_MOVE" :style="{ color: '#5c8bb0' }">
                   <GreatMoveIcon/> {{ lastMove.piece.type != 'p' ? lastMove.piece.type.toUpperCase() + lastMove.algebraicNotation : lastMove.algebraicNotation }} is a great move
                </span>
                <span v-if="lastMove.mark == MOVE_MARK.BEST_MOVE" :style="{ color: '#96bc4b' }">
                   <BestMoveIcon/> {{ lastMove.piece.type != 'p' ? lastMove.piece.type.toUpperCase() + lastMove.algebraicNotation : lastMove.algebraicNotation }} is best
                </span>
                <span v-if="lastMove.mark == MOVE_MARK.EXCELLENT" :style="{ color: '#96bc4b' }">
                   <ExcellentMoveIcon/> {{ lastMove.piece.type != 'p' ? lastMove.piece.type.toUpperCase() + lastMove.algebraicNotation : lastMove.algebraicNotation }} is excellent
                </span>
                <span v-if="lastMove.mark == MOVE_MARK.GOOD" :style="{ color: '#96af8b' }">
                   <GoodMoveIcon/> {{ lastMove.piece.type != 'p' ? lastMove.piece.type.toUpperCase() + lastMove.algebraicNotation : lastMove.algebraicNotation }} is good
                </span>
                <span v-if="lastMove.mark == MOVE_MARK.INACCURACY" :style="{ color: '#f0c15c' }">
                   <InaccuracyIcon/> {{ lastMove.piece.type != 'p' ? lastMove.piece.type.toUpperCase() + lastMove.algebraicNotation : lastMove.algebraicNotation }} is an inaccuracy
                </span>
                <span v-if="lastMove.mark == MOVE_MARK.MISTAKE" :style="{ color: '#e58f2a' }">
                   <MistakeIcon/> {{ lastMove.piece.type != 'p' ? lastMove.piece.type.toUpperCase() + lastMove.algebraicNotation : lastMove.algebraicNotation }} is a mistake
                </span>
                <span v-if="lastMove.mark == MOVE_MARK.BLUNDER" :style="{ color: '#ca3431' }">
                   <BlunderIcon/> {{ lastMove.piece.type != 'p' ? lastMove.piece.type.toUpperCase() + lastMove.algebraicNotation : lastMove.algebraicNotation }} is a blunder
                </span>
            </a-typography-title>
        </a-descriptions-item>
    </a-descriptions>
</template>