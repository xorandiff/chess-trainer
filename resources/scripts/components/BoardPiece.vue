<script setup lang="ts">
defineProps<{
  piece: Piece;
  posLeft: number;
  posTop: number;
}>();
</script>

<template>
    <Teleport to="body" v-if="posLeft && posTop && !piece.captured">
      <div
        :class="`piece ${piece.color}${piece.type}`"
        :style="{ left: `${posLeft}px`, top: `${posTop}px` }"
      ></div>
    </Teleport>
    <div 
      v-else
      :class="[`piece ${piece.color}${piece.type}`, { captured: piece.captured }]"
      :style="{ transform: `translateX(${(piece.file - 1) * 100}%) translateY(${(piece.rank - 1) * 100}%)` }"
    ></div>
</template>