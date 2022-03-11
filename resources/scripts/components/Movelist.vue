<script setup lang="ts">
import _ from 'lodash';
import { Chessboard, PIECE_COLOR } from "@/chessboard";
import { useBoardStore } from "@/stores/board";
const store = useBoardStore();

const { moves } = store;
</script>

<template>
    <a-list :style="{ height: '340px', overflow: 'auto' }" bordered>
        <a-list-item v-for="(fullmove, index) in _.reverse([...moves])">
            {{ (moves.length - index) + '. ' }} 
            {{ fullmove[PIECE_COLOR.WHITE].algebraicNotation }} 
            {{ (fullmove[PIECE_COLOR.BLACK] ? fullmove[PIECE_COLOR.BLACK]!.algebraicNotation : '') }}
        </a-list-item>
    </a-list>
</template>