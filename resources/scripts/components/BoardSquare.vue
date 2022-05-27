<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useBoardStore } from "@/stores/board";

const props = defineProps<{
  index: number;
  squareData: SquareData;
  size: number;
}>();

const highlight = ref(false);
const store = useBoardStore();
const { pieceMoveFromActive, pieceMouseDown, setArrowFrom, setArrowTo } = store;
const { dragging, getPiece } = storeToRefs(store);
</script>

<template>
  <div 
    class="square"
    :class="{ highlight: squareData.active || squareData.highlight }"
    :style="{ width: `${size}px`, height: `${size}px`, cursor: getPiece(index) ? 'grab' : 'default' }"
    @mousedown.left="pieceMouseDown(index)"
    @mouseup.left="pieceMoveFromActive(index)"
    @mouseenter="highlight = dragging >= 11"
    @mouseleave="highlight = false"
    @click.right.prevent
    @mousedown.right="setArrowFrom(index)"
    @mouseup.right.exact="setArrowTo(index, 'orange')"
    @mouseup.right.ctrl="setArrowTo(index, 'red')"
    @mouseup.right.shift="setArrowTo(index, 'green')"
    @mouseup.right.alt="setArrowTo(index, 'blue')"
  >
    <div v-if="squareData.highlightColor" :class="['highlight', squareData.highlightColor]"></div>
    <div v-if="squareData.active || highlight" class="active" :style="{ width: `${size}px`, height: `${size}px` }"></div>
    <div v-if="squareData.legalMove" :class="getPiece(index) ? 'capture' : 'move'"></div>
  </div>
</template>
