<script setup lang="ts">
import { useBoardStore } from "@/stores/board";

const store = useBoardStore();
const { pieceMouseDown } = store;

defineProps<{
  piece: Piece;
  flip: boolean;
  square: Square;
}>();

function startDrag(e: DragEvent) {
  e.dataTransfer!.dropEffect = 'move'
  e.dataTransfer!.effectAllowed = 'move'
}
</script>

<template>
    <div
      class="piece"
      :class="[`${piece.color}${piece.type}`, flip ? 'flip-piece' : '']"
      @mousedown.left="pieceMouseDown(square)"
      @dragstart="startDrag"
      draggable="true"
    ></div>
</template>