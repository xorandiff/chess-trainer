<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  rank: number;
  file: number;
  piece: string;
  posLeft: number;
  posTop: number;
}>();

const classString = computed(() => `piece ${props.piece == props.piece.toLowerCase() ? 'b' : 'w'}${props.piece.toLowerCase()}`);
</script>

<template>
    <Teleport to="body" v-if="posLeft && posTop">
      <div
        :class="classString"
        :style="{ left: `${posLeft}px`, top: `${posTop}px` }"
      ></div>
    </Teleport>
    <div 
      v-else
      :class="classString"
      :style="{ transform: `translateX(${(file - 1) * 100}%) translateY(${(rank - 1) * 100}%)` }"
    ></div>
</template>