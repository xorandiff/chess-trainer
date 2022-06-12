<script setup lang="ts">
import { useBoardStore } from "@/stores/board";
import { HIGHLIGHT_COLOR } from '@/enums';

defineProps<{
  index: number;
  legalMove: boolean;
  highlight: HIGHLIGHT_COLOR;
  highlightBorder: boolean;
  occupied: boolean;
  active: boolean;
}>();

const store = useBoardStore();
const { pieceMoveFromActive, pieceMouseDown, setArrowFrom, setArrowTo } = store;
</script>

<template>
  <div 
    :class="['square', { highlight: active }]"
    :style="{ cursor: occupied ? 'grab' : 'default' }"
    @mousedown.left="pieceMouseDown(index)"
    @mouseup.left="pieceMoveFromActive(index)"
    @click.right.prevent
    @mousedown.right="setArrowFrom(index)"
    @mouseup.right.exact="setArrowTo(index, HIGHLIGHT_COLOR.RED)"
    @mouseup.right.ctrl="setArrowTo(index, HIGHLIGHT_COLOR.ORANGE)"
    @mouseup.right.shift="setArrowTo(index, HIGHLIGHT_COLOR.GREEN)"
    @mouseup.right.alt="setArrowTo(index, HIGHLIGHT_COLOR.BLUE)"
  >
    <div v-if="highlight !== HIGHLIGHT_COLOR.NONE" :class="['highlight', highlight]"></div>
    <div v-if="legalMove" :class="occupied ? 'capture' : 'move'"></div>
  </div>
</template>
