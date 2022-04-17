<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useBoardStore } from "@/stores/board";

const props = defineProps<{
  index: number,
  squareData: SquareData
}>();

const highlight = ref(false);
const store = useBoardStore();
const { pieceMoveFromActive, pieceMouseDown, setArrowFrom, setArrowTo } = store;
const { getPiece } = storeToRefs(store);

</script>

<template>
  <div 
    class="square"
    :class="{ highlight: squareData.active || squareData.highlight, dragging: store.dragging >= 11 }"
    :style="{ cursor: getPiece(index) !== undefined ? 'pointer' : 'default' }"
    @mousedown.left="pieceMouseDown(index)"
    @mouseup.left="pieceMoveFromActive(index)"
    @mouseenter="highlight = store.dragging >= 11"
    @mouseleave="highlight = false"
    @click.right.prevent
    @mousedown.right="setArrowFrom(index)"
    @mouseup.right.exact="setArrowTo(index, 'orange')"
    @mouseup.right.ctrl="setArrowTo(index, 'red')"
    @mouseup.right.shift="setArrowTo(index, 'green')"
    @mouseup.right.alt="setArrowTo(index, 'blue')"
  >
    <div v-if="squareData.highlightColor" v-bind="$attrs" :class="['highlight', squareData.highlightColor]"></div>
    <div v-if="squareData.active || highlight" v-bind="$attrs" class="active"></div>
    <div v-if="squareData.legalMove" :class="getPiece(index) ? 'capture' : 'move'"></div>
    <slot></slot>
  </div>
</template>
