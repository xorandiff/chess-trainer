<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { PIECE_COLOR, PIECE_TYPE } from "@/enums";
import { useBoardStore } from "@/stores/board";

const store = useBoardStore();

const { movesReversed, movesLength } = storeToRefs(store);
const { showMove } = store;
</script>

<template>
    <a-descriptions :column="1" size="small" bordered>
        <a-descriptions-item>
            <a-row justify="start" :gutter="16">
                <a-col class="moveNumber" v-for="(fullmove, index) in movesReversed">
                    {{ movesLength - index }}.  
                    <a-button class="moveButton" type="text" @click="showMove(movesLength - index - 1, PIECE_COLOR.WHITE)">
                        <template #icon v-if="fullmove[PIECE_COLOR.WHITE]!.piece.type !== PIECE_TYPE.PAWN">
                            <span :class="`chessFont f-${fullmove[PIECE_COLOR.WHITE]!.piece.type}w`"></span>
                        </template>
                        {{ fullmove[PIECE_COLOR.WHITE]!.algebraicNotation }}
                    </a-button>
                    <template v-if="fullmove[PIECE_COLOR.BLACK]">
                        <a-button class="moveButton" type="text" @click="showMove(movesLength - index - 1, PIECE_COLOR.BLACK)">
                            <template #icon v-if="fullmove[PIECE_COLOR.BLACK]!.piece.type !== PIECE_TYPE.PAWN">
                                <span :class="`chessFont f-${fullmove[PIECE_COLOR.BLACK]!.piece.type}b`"></span>
                            </template>
                            {{ fullmove[PIECE_COLOR.BLACK]!.algebraicNotation }}
                        </a-button>
                    </template>
                </a-col>
            </a-row>
        </a-descriptions-item>
    </a-descriptions>
</template>