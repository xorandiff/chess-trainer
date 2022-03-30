<script setup lang="ts">
defineProps<{
  piece: Piece;
  flip: boolean;
}>();
</script>

<template>
    <div
      class="piece"
      :class="[`${piece.color}${piece.type}`, flip ? 'flip-piece' : '']"
    ></div>
</template>