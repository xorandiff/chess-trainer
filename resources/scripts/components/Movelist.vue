<script setup lang="ts">
import _ from 'lodash';
import { Chessboard, PIECE_COLOR } from "@/chessboard";
import { useBoardStore } from "@/stores/board";
const store = useBoardStore();

const { moves } = store;
</script>

<template>
    <a-list :style="{ height: '340px', overflow: 'auto' }" bordered>
        <a-list-item v-for="(fullmove, index) in _.reverse([...moves])">{{ (moves.length - index) + '. ' }} {{ Chessboard.moveToAlgebraic(fullmove[PIECE_COLOR.WHITE]) + ' ' + (fullmove[PIECE_COLOR.BLACK] ? Chessboard.moveToAlgebraic(fullmove[PIECE_COLOR.BLACK]!) : '') }}</a-list-item>
        <template #header>
            <div>Moves</div>
        </template>
    </a-list>
</template>