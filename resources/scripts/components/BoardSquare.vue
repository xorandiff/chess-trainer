<script setup lang="ts">
import { ref } from 'vue';
import { useBoardStore } from "@/stores/board";

defineProps<{
  rank: number,
  file: number,
  squareData: SquareData,
}>();

const highlight = ref(false);
const store = useBoardStore();
const { pieceMoveFromActive, pieceMouseDown, setArrowFrom, setArrowTo } = store;
</script>

<template>
  <div 
    class="square"
    :class="{ highlight: squareData.active || squareData.highlight, dragging: store.dragging >= 0 }"
    :style="{ cursor: squareData.piece ? 'pointer' : 'default' }"
    @mousedown.left="pieceMouseDown([rank, file])"
    @mouseup.left="pieceMoveFromActive([rank, file])"
    @mouseenter="highlight = store.dragging >= 0"
    @mouseleave="highlight = false"
    @click.right.prevent
    @mousedown.right="setArrowFrom([rank, file])"
    @mouseup.right="setArrowTo([rank, file])"
  >
    <div v-if="squareData.highlightColor" v-bind="$attrs" :class="squareData.highlightColor"></div>
    <div v-if="squareData.active || highlight" v-bind="$attrs" class="active"></div>
    <div v-if="squareData.legalMove" :class="squareData.piece ? 'capture' : 'move'"></div>
    <slot></slot>
  </div>
</template>
