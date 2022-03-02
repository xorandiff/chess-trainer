<script setup lang="ts">
defineProps<{
  piece?: Piece;
  flip: boolean
}>();

defineEmits<{
    (e: 'pieceMouseDown') : void,
}>();
</script>
<script lang="ts">
export default {
  methods: {
    startDrag(e : any) {
      e.dataTransfer.dropEffect = 'move'
      e.dataTransfer.effectAllowed = 'move'
    }
  }
}
</script>

<template>
    <div
      v-if="piece"
      class="piece"
      :class="[`${piece.color}${piece.type}`, flip ? 'flip-piece' : '']"
      @mousedown="$emit('pieceMouseDown')"
      @dragstart="startDrag($event)"
      draggable="true"
    ></div>
</template>