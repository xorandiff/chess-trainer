<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { PIECE_TYPE, PIECE_COLOR } from "@/enums";
import { useBoardStore } from "@/stores/board";
import Piece from "./Piece.vue";

const store = useBoardStore();
const { board, color, currentMove, pieceMouseUp, pieceMoveFromActive, setPromotionPiece, setDraggedOver, showMove, clearColoredHighlights, setArrowFrom, setArrowTo } = store;

function handleKeydown(e: KeyboardEvent) {
  switch (e.key) {
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

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <div id="chessboard" :class="color === 'b' ? 'flip' : ''" @mouseup="pieceMouseUp" @mousedown.left="clearColoredHighlights">
     <svg class="arrows" viewBox="0 0 100 100">
       <template v-for="arrow in store.arrows">
        <polygon class="arrow" :transform="`rotate(${arrow.rotation})`" :points="arrow.points"></polygon>
       </template>
    </svg> 
    <div class="row" v-for="i in 8">
      <template v-for="j in 8">
        <div 
          class="square"
          :class="[board[i-1][j-1].active || board[i-1][j-1].highlight ? 'highlight' : '' ]"
          @drop="pieceMoveFromActive([i-1, j-1])"
          @dragenter.prevent
          @dragover="e => {e.preventDefault(); return setDraggedOver([i-1, j-1]);}"
          @click.right.prevent
          @mousedown.right="setArrowFrom([i-1, j-1])"
          @mouseup.right="setArrowTo([i-1, j-1])"
        >
          <div v-if="board[i-1][j-1].highlightColor" :class="board[i-1][j-1].highlightColor"></div>
          <div v-if="board[i-1][j-1].active || board[i-1][j-1].draggedOver" class="active"></div>
          <div v-if="board[i-1][j-1].legalMove" :class="board[i-1][j-1].piece ? 'capture' : 'move'"></div>
          <Piece 
            v-if="board[i-1][j-1].piece"
            :piece="board[i-1][j-1].piece!"
            :square="[i-1, j-1]"
            :flip="color === 'b'"
          ></Piece>
          <div v-if="i === 8" class="fileLabel">{{ String.fromCharCode('a'.charCodeAt(0) + (j - 1)) }}</div>
          <div v-if="j === 1" class="rankLabel">{{ 9 - i }}</div>
        </div>
      </template>
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
