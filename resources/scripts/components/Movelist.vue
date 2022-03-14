<script setup lang="ts">
import _ from 'lodash';
import { PIECE_COLOR } from "@/chessboard";
import { useBoardStore } from "@/stores/board";
const store = useBoardStore();
const { showMove, currentMove } = store;
</script>

<template>
    <a-list :style="{ height: '280px', overflow: 'auto' }" bordered>
        <a-list-item v-for="(fullmove, index) in _.reverse([...store.moves])">
            {{ (store.moves.length - index) + '. ' }} 
            <a-typography-link @click="showMove(store.moves.length - index - 1, PIECE_COLOR.WHITE)" :strong="currentMove.index === store.moves.length - index - 1 && currentMove.color === PIECE_COLOR.WHITE">
                {{ fullmove[PIECE_COLOR.WHITE].algebraicNotation + ' ' }} 
            </a-typography-link>
            <template v-if="fullmove[PIECE_COLOR.BLACK]">
                <a-typography-link @click="showMove(store.moves.length - index - 1, PIECE_COLOR.BLACK)" :strong="currentMove.index === store.moves.length - index - 1 && currentMove.color === PIECE_COLOR.BLACK">
                    {{ fullmove[PIECE_COLOR.BLACK]!.algebraicNotation }}
                </a-typography-link>
            </template>
        </a-list-item>
    </a-list>
</template>