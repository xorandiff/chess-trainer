<script setup lang="ts">
import { Chessboard, PIECE_COLOR } from "@/chessboard";
import { useBoardStore } from "@/stores/board";
const store = useBoardStore();

const { moves } = store;
</script>
<script lang="ts">
export default {
  methods: {
    startDrag(e : any) {
      e.dataTransfer.dropEffect = 'move'
      e.dataTransfer.effectAllowed = 'move'
    }
  }
}
</script>

<template>
    <a-list :style="{ height: '600px', overflow: 'auto' }" bordered>
        <a-list-item v-for="(fullmove, index) in moves">{{ (index + 1) + '. ' }} {{ Chessboard.moveToAlgebraic(fullmove[PIECE_COLOR.WHITE]) + ' ' + (fullmove[PIECE_COLOR.BLACK] ? Chessboard.moveToAlgebraic(fullmove[PIECE_COLOR.BLACK]!) : '') }}</a-list-item>
        <template #header>
            <div>Moves</div>
        </template>
    </a-list>
</template>