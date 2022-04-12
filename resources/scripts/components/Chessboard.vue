<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { SettingOutlined, RetweetOutlined, ExpandAltOutlined } from '@ant-design/icons-vue';
import { PIECE_TYPE, PIECE_COLOR } from "@/enums";
import { useBoardStore } from "@/stores/board";
import BoardPiece from "./BoardPiece.vue";
import BoardSquare from "./BoardSquare.vue";
import Eval from "./Eval.vue";

const props = defineProps<{
  size: number;
}>();

const boardSizeMax = props.size;
const boardSizeMin = 300;

const boardSize = ref<number>(props.size);
const isMouseDown = ref<boolean>(false);
const flipped = ref<boolean>(false);

const squareSize = computed(() => boardSize.value / 8);
const labelFontSize = computed(() => boardSize.value * 0.027);
const indexArray = computed(() => flipped.value ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7]);

const boardSizeStyle = computed(() => {
  return { minWidth: `${boardSize.value}px`, minHeight: `${boardSize.value}px` };
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

  if (isMouseDown.value) {
    if (boardSize.value >= boardSizeMin && boardSize.value <= boardSizeMax) {
      if (boardSize.value + event.movementY > boardSizeMax) {
        boardSize.value = boardSizeMax;
      } else if (boardSize.value + event.movementY < boardSizeMin) {
        boardSize.value = boardSizeMin;
      } else {
        boardSize.value += event.movementY;
      }
    }
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

function handleMouseUp(event: MouseEvent) {
  isMouseDown.value = false;
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('mousemove', handleMousemove);
  window.addEventListener('mouseup', handleMouseUp);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('mousemove', handleMousemove);
  window.removeEventListener('mouseup', handleMouseUp);
});
</script>

<template>
  <div id="chessboardContainer">
    <Eval :size="boardSize" />
    <div id="chessboard" @mouseup.left="pieceMouseUp" @mousedown.left="clearColoredHighlights">
      <svg id="arrows" :style="{ width: `${boardSize}px`, height: `${boardSize}px` }" viewBox="0 0 100 100">
        <template v-for="arrow in store.arrows">
          <polygon :class="['arrow', arrow.color]" :transform="arrow.transform" :points="arrow.points"></polygon>
        </template>
      </svg>
      <div class="row" v-for="i in indexArray">
        <BoardSquare v-for="j in indexArray" :rank="i" :file="j" :squareData="board[i][j]" :style="squareSizeStyle">
          <template v-if="board[i][j].piece">
            <template v-if="store.dragging === i*10 + j">
              <Teleport to="body">
                <BoardPiece
                  class="dragging"
                  :piece="board[i][j].piece!"
                  :style="{ ...squareSizeStyle, left: `${pieceLeft}px`, top: `${pieceTop}px` }"
                ></BoardPiece>
              </Teleport>
            </template>
            <BoardPiece
              v-else
              :piece="board[i][j].piece!"
            ></BoardPiece>
          </template>
        </BoardSquare>
        <div class="endRow"></div>
      </div>
      <div id="labels" :style="boardSizeStyle">
        <div id="ranks" :style="{ width: `${squareSize}px`, height: `${boardSize}px` }">
          <div v-for="rank in indexArray" :style="{ height: `${squareSize}px`, fontSize: `${labelFontSize}px` }">
            {{ 8 - rank }}
          </div>
        </div>
        <div id="files" :style="{ width: `${boardSize}px` }">
          <div v-for="file in indexArray" :style="{ width: `${squareSize}px`, fontSize: `${labelFontSize}px`, left: `${squareSize * (flipped ? 7-file : file)}px` }">
            {{ String.fromCharCode('a'.charCodeAt(0) + file) }}
          </div>
        </div>
      </div>
    </div>
    <div id="sidebar" :style="{ height: `${boardSize}px` }">
      <div id="settings">
        <a-button size="small" type="dashed">
            <template #icon>
                <SettingOutlined />
            </template>
        </a-button>
      </div>
      <div id="hiddenButtons">
        <div id="flip">
          <a-button size="small" type="dashed" @click="flipped = flipped ? false : true">
              <template #icon>
                  <RetweetOutlined />
              </template>
          </a-button>
        </div>
        <div id="resize">
            <a-button size="small" type="dashed" @mousedown="isMouseDown = true">
                <template #icon>
                    <ExpandAltOutlined />
                </template>
            </a-button>
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
