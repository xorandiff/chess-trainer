<script setup lang="ts">
import _ from 'lodash';
import { PIECE_COLOR } from "@/chessboard";
import { useBoardStore } from "@/stores/board";
const store = useBoardStore();
</script>

<template>
    <a-list :style="{ height: '340px', overflow: 'auto' }" bordered>
        <a-list-item v-for="(fullmove, index) in _.reverse([...store.moves])">
            {{ (store.moves.length - index) + '. ' }} 
            {{ fullmove[PIECE_COLOR.WHITE].algebraicNotation }} 
            {{ (fullmove[PIECE_COLOR.BLACK] ? fullmove[PIECE_COLOR.BLACK]!.algebraicNotation : '') }}
        </a-list-item>
    </a-list>
</template>