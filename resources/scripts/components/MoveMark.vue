<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { MOVE_MARK } from "@/enums";
import { useBoardStore } from "@/stores/board";
import MoveFont from "@/components/MoveFont.vue";

const store = useBoardStore();

const { lastMove } = storeToRefs(store);
</script>

<template>
    <a-descriptions :column="1" size="small" bordered>
        <a-descriptions-item>
            <span v-if="lastMove.mark == MOVE_MARK.BEST_MOVE" :style="{ color: 'green' }">
                <MoveFont :move="lastMove" /> {{ lastMove.algebraicNotation }} is a best move
            </span>
            <span v-if="lastMove.mark == MOVE_MARK.EXCELLENT" :style="{ color: 'green' }">
                <MoveFont :move="lastMove" /> {{ lastMove.algebraicNotation }} is an excellent move
            </span>
            <span v-if="lastMove.mark == MOVE_MARK.GOOD" :style="{ color: 'lightgreen' }">
                <MoveFont :move="lastMove" /> {{ lastMove.algebraicNotation }} is a good move
            </span>
            <span v-if="lastMove.mark == MOVE_MARK.INACCURACY" :style="{ color: 'yellow' }">
                <MoveFont :move="lastMove" /> {{ lastMove.algebraicNotation }} is a inaccuracy
            </span>
            <span v-if="lastMove.mark == MOVE_MARK.MISTAKE" :style="{ color: 'orange' }">
                <MoveFont :move="lastMove" /> {{ lastMove.algebraicNotation }} is a mistake
            </span>
            <span v-if="lastMove.mark == MOVE_MARK.BLUNDER" :style="{ color: 'red' }">
                <MoveFont :move="lastMove" /> {{ lastMove.algebraicNotation }} is a blunder
            </span>
        </a-descriptions-item>
    </a-descriptions>
</template>