<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { PIECE_TYPE, PIECE_COLOR } from "@/enums";
import { useBoardStore } from "@/stores/board";
import BoardPiece from "./BoardPiece.vue";
import BoardSquare from "./BoardSquare.vue";

const store = useBoardStore();
const { board, color, currentMove, pieceMouseUp, setPromotionPiece, showMove, clearColoredHighlights } = store;

const x = ref(0);
const y = ref(0);

function handleMousemove(event: MouseEvent) {
  if (store.dragging >= 0) {
    x.value += event.movementX;
    y.value += event.movementY;
  } else {
    x.value = 0;
    y.value = 0;
  }
}

function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case "ArrowLeft":
      if (currentMove.color === PIECE_COLOR.BLACK) {
        showMove(currentMove.index, PIECE_COLOR.WHITE);
      } else {
        showMove(currentMove.index - 1, PIECE_COLOR.BLACK);
      }
    break;
    case "ArrowRight": 
      if (currentMove.color === PIECE_COLOR.WHITE) {
        showMove(currentMove.index, PIECE_COLOR.BLACK);
      } else {
        showMove(currentMove.index + 1, PIECE_COLOR.WHITE);
      }
    break;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('mousemove', handleMousemove);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('mousemove', handleMousemove);
});
</script>

<template>
  <div id="chessboard" :class="color === 'b' ? 'flip' : ''" @mouseup.left="pieceMouseUp" @mousedown.left="clearColoredHighlights">
    <svg class="arrows" viewBox="0 0 100 100">
      <template v-for="arrow in store.arrows">
        <polygon class="arrow" :transform="`rotate(${arrow.rotation})`" :points="arrow.points"></polygon>
      </template>
    </svg>
    <div class="row" v-for="i in 8">
      <BoardSquare v-for="j in 8" :rank="i-1" :file="j-1" :squareData="board[i-1][j-1]">
        <BoardPiece
          v-if="board[i-1][j-1].piece"
          :piece="board[i-1][j-1].piece!"
          :flip="color === 'b'"
          :style="{ transform: store.dragging === (i-1)*10 + (j-1) ? `translate(${x}px, ${y}px)` : 'none', zIndex: store.dragging === (i-1)*10 + (j-1) ? 5 : 3 }"
        ></BoardPiece>
      </BoardSquare>
    </div>

    <a-modal
      :visible="store.promotionModalVisible"
      :footer="null"
      :closable="false"
      title="Choose promotion piece"
      style="top: 20px"
    >
      <a-button @click="() => setPromotionPiece(PIECE_TYPE.QUEEN)" :style="{ width: '85px', height: '85px', padding: '5px', marginRight: '10px' }"><img src="img/pieces/wq.png" width="75" height="75"></a-button>
      <a-button @click="() => setPromotionPiece(PIECE_TYPE.ROOK)" :style="{ width: '85px', height: '85px', padding: '5px', marginRight: '10px' }"><img src="img/pieces/wr.png" width="75" height="75"></a-button>
      <a-button @click="() => setPromotionPiece(PIECE_TYPE.KNIGHT)" :style="{ width: '85px', height: '85px', padding: '5px', marginRight: '10px' }"><img src="img/pieces/wn.png" width="75" height="75"></a-button>
      <a-button @click="() => setPromotionPiece(PIECE_TYPE.BISHOP)" :style="{ width: '85px', height: '85px', padding: '5px' }"><img src="img/pieces/wb.png" width="75" height="75"></a-button>
    </a-modal>
  </div>
</template>
