<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useBoardStore } from '@/stores/board';

const props = defineProps<{
  piece: Piece;
  size: number;
}>();

const store = useBoardStore();
const { dragging } = storeToRefs(store);

const pieceLeft = ref(0);
const pieceTop = ref(0);

function handleMousemove(event: MouseEvent) {
  if (dragging.value === props.piece.square) {
    pieceLeft.value = event.pageX - (props.size / 2);
    pieceTop.value = event.pageY - (props.size / 2);
  }
}

onMounted(() => window.addEventListener('mousemove', handleMousemove));
onUnmounted(() => window.removeEventListener('mousemove', handleMousemove));
</script>

<template>
    <Teleport to="body" v-if="dragging === piece.square">
      <div
        :class="`piece ${piece.color}${piece.type}`"
        :style="{ opacity: piece.captured ? '0' : '1', left: dragging === piece.square ? `${pieceLeft}px` : `30px`, top: dragging === piece.square ? `${pieceTop}px` : `0px`, width: `${size}px`, height: `${size}px` }"
      ></div>
    </Teleport>
    <div 
      v-else
      :class="`piece ${piece.color}${piece.type}`"
      :style="{ opacity: piece.captured ? '0' : '1', transform: `translateX(${(piece.file - 1) * size}px) translateY(${(piece.rank - 1) * size}px)`, width: `${size}px`, height: `${size}px` }"
    ></div>
</template>