<script setup lang="ts">

defineProps<{
  rank: number,
  file: number,
  hasPiece: boolean,
}>();

defineEmits<{
  (e: 'onDrop') : void,
}>();
</script>
<script lang="ts">
export default {
  data() {
    return {
      isActive: false,
    }
  }
}
</script>

<template>
  <div
    class="square"
    :class="isActive && hasPiece ? 'active' : ''"
    :id="`${rank}${file}`"
    @mousedown="isActive = true"
    @mouseup="isActive = false"
    @drop="$emit('onDrop')"
  >
    
    <slot></slot>
  </div>
</template>
