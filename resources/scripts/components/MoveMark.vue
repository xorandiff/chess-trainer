<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { MOVE_MARK } from "@/enums";
import { useBoardStore } from "@/stores/board";

const store = useBoardStore();

const { lastMove } = storeToRefs(store);
</script>

<template>
    <a-descriptions :column="1" size="small" bordered>
        <a-descriptions-item>
            <span v-if="lastMove.mark == MOVE_MARK.BEST_MOVE" :style="{ color: 'green' }">
                {{ lastMove.algebraicNotation }} is a best move
            </span>
            <span v-if="lastMove.mark == MOVE_MARK.EXCELLENT" :style="{ color: 'green' }">
                {{ lastMove.algebraicNotation }} is an excellent move
            </span>
            <span v-if="lastMove.mark == MOVE_MARK.GOOD" :style="{ color: 'lightgreen' }">
                {{ lastMove.algebraicNotation }} is a good move
            </span>
            <span v-if="lastMove.mark == MOVE_MARK.INACCURACY" :style="{ color: 'yellow' }">
                {{ lastMove.algebraicNotation }} is a inaccuracy
            </span>
            <span v-if="lastMove.mark == MOVE_MARK.MISTAKE" :style="{ color: 'orange' }">
                {{ lastMove.algebraicNotation }} is a mistake
            </span>
            <span v-if="lastMove.mark == MOVE_MARK.BLUNDER" :style="{ color: 'red' }">
                {{ lastMove.algebraicNotation }} is a blunder
            </span>
        </a-descriptions-item>
    </a-descriptions>
</template>