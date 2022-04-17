<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { PIECE_COLOR, PIECE_TYPE } from "@/enums";
import { useBoardStore } from "@/stores/board";

const store = useBoardStore();

const { moves, currentMoveIndex } = storeToRefs(store);
const { showMove } = store;
</script>

<template>
    <a-descriptions :column="1" size="small" bordered>
        <a-descriptions-item>
            <a-row justify="start" :gutter="16">
                <span v-for="(move, index) in moves">
                    <span class="moveNumber" v-if="move.piece.color === PIECE_COLOR.WHITE">
                        {{ Math.floor(index / 2) + 1 }}. 
                    </span>
                    <a-button class="moveButton" :type="currentMoveIndex === index ? 'dashed' : 'text'" @click="showMove(index)">
                        <template #icon v-if="move.piece.type !== PIECE_TYPE.PAWN">
                            <span :class="`chessFont f-${move.piece.type}${move.piece.color}`"></span>
                        </template>
                        {{ move.algebraicNotation }}
                    </a-button>
                </span>
            </a-row>
        </a-descriptions-item>
    </a-descriptions>
</template>