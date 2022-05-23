<script setup lang="ts">
import { PIECE_TYPE } from "@/enums";

defineProps<{
  move: Move;
}>();
</script>

<template>
    <span 
      v-if="move.piece.type != PIECE_TYPE.PAWN && !move.algebraicNotation.includes('O') && !move.promotionType"
      :class="`chessFont f-${move.piece.type}${move.piece.color}`"
    >
    </span>
</template>