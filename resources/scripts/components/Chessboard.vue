<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { PIECE_TYPE, PIECE_COLOR } from "@/enums";
import { useBoardStore } from "@/stores/board";
import BoardPiece from "./BoardPiece.vue";
import BoardSquare from "./BoardSquare.vue";

const props = defineProps<{
  size: number;
}>();

const squareSize = computed(() => props.size / 8);
const labelFontSize = computed(() => props.size * 0.027);

const boardSizeStyle = computed(() => {
  return { width: `${props.size}px`, height: `${props.size}px` };
});

const squareSizeStyle = computed(() => {
  return { width: `${squareSize.value}px`, height: `${squareSize.value}px` };
});

const pieceLeft = ref(0);
const pieceTop = ref(0);

const store = useBoardStore();
const { board, color, currentMove, pieceMouseUp, setPromotionPiece, showMove, clearColoredHighlights } = store;

function handleMousemove(event: MouseEvent) {
  pieceLeft.value = event.pageX - (squareSize.value / 2);
  pieceTop.value = event.pageY - (squareSize.value / 2);
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
  <div id="chessboard" :style="boardSizeStyle" :class="{ flip: color === 'b' }" @mouseup.left="pieceMouseUp" @mousedown.left="clearColoredHighlights">
    <svg class="arrows" :style="boardSizeStyle" viewBox="0 0 100 100">
      <template v-for="arrow in store.arrows">
        <polygon class="arrow" :transform="`rotate(${arrow.rotation})`" :points="arrow.points"></polygon>
      </template>
    </svg>
    <div class="row" v-for="i in 8">
      <BoardSquare v-for="j in 8" :rank="i-1" :file="j-1" :squareData="board[i-1][j-1]" :style="squareSizeStyle">
        <template v-if="board[i-1][j-1].piece">
          <template v-if="store.dragging === (i-1)*10 + (j-1)">
            <Teleport to="body">
              <BoardPiece
                class="dragging"
                :piece="board[i-1][j-1].piece!"
                :flip="color === 'b'"
                :style="{ ...squareSizeStyle, left: `${pieceLeft}px`, top: `${pieceTop}px` }"
              ></BoardPiece>
            </Teleport>
          </template>
          <BoardPiece
            v-else
            :piece="board[i-1][j-1].piece!"
            :flip="color === 'b'"
          ></BoardPiece>
        </template>
      </BoardSquare>
    </div>
    <div id="labels" :style="boardSizeStyle">
      <div id="ranks" :style="{ width: `${squareSize}px`, height: `${size}px` }">
        <div v-for="rank in 8" :style="{ height: `${squareSize}px`, fontSize: `${labelFontSize}px` }">
          {{ 9 - rank }}
        </div>
      </div>
      <div id="files" :style="{ width: `${size}px` }">
        <div v-for="file in 8" :style="{ width: `${squareSize}px`, fontSize: `${labelFontSize}px` }">
          {{ String.fromCharCode('a'.charCodeAt(0) + file - 1) }}
        </div>
      </div>
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
