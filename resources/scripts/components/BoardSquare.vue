<script setup lang="ts">
import { useBoardStore } from "@/stores/board";

defineProps<{
  index: number;
  squareData: SquareData;
  occupied: boolean;
}>();

const store = useBoardStore();
const { pieceMoveFromActive, pieceMouseDown, setArrowFrom, setArrowTo } = store;
</script>

<template>
  <div 
    :class="['square', { highlight: squareData.active || squareData.highlight }]"
    :style="{ cursor: occupied ? 'grab' : 'default' }"
    @mousedown.left="pieceMouseDown(index)"
    @mouseup.left="pieceMoveFromActive(index)"
    @click.right.prevent
    @mousedown.right="setArrowFrom(index)"
    @mouseup.right.exact="setArrowTo(index, 'orange')"
    @mouseup.right.ctrl="setArrowTo(index, 'red')"
    @mouseup.right.shift="setArrowTo(index, 'green')"
    @mouseup.right.alt="setArrowTo(index, 'blue')"
  >
    <div v-if="squareData.highlightColor" :class="['highlight', squareData.highlightColor]"></div>
    <div v-if="squareData.legalMove" :class="occupied ? 'capture' : 'move'"></div>
  </div>
</template>
