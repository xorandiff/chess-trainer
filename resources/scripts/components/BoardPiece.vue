<script setup lang="ts">
defineProps<{
  piece: Piece;
}>();
</script>

<template>
    <div
      class="piece"
      :class="`${piece.color}${piece.type}`"
    ></div>
</template>