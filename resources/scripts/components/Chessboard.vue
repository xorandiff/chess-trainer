<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { storeToRefs } from 'pinia';
import { SettingOutlined, RetweetOutlined, ExpandAltOutlined } from '@ant-design/icons-vue';
import { PIECE_TYPE } from "@/enums";
import { useBoardStore } from "@/stores/board";
import BoardPiece from "./BoardPiece.vue";
import BoardSquare from "./BoardSquare.vue";
import Eval from "./Eval.vue";

const boardSizeMax = window.screen.height - 200;
const boardSizeMin = 300;

const boardSize = ref<number>(boardSizeMax);
const isMouseDown = ref<boolean>(false);
const flipped = ref<boolean>(false);

const squareSize = computed(() => boardSize.value / 8);
const labelFontSize = computed(() => boardSize.value * 0.027);
const indexArray = computed(() => flipped.value ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8]);

const boardSizeStyle = computed(() => {
  return { width: `${boardSize.value}px`, height: `${boardSize.value}px` };
});

const squareSizeStyle = computed(() => {
  return { width: `${squareSize.value}px`, height: `${squareSize.value}px` };
});

const pieceLeft = ref(0);
const pieceTop = ref(0);

const store = useBoardStore();
const { showEvaluation, currentMoveIndex, arrows, getPiece, dragging, promotionModalVisible } = storeToRefs(store);
const { pieceMouseUp, setPromotionPiece, showMove, clearColoredHighlights } = store;

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
      showMove(currentMoveIndex.value - 1);
    break;
    case "ArrowRight": 
      showMove(currentMoveIndex.value + 1);
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
    <Eval v-if="showEvaluation" :size="boardSize" />
    <div id="chessboard" @mouseup.left="pieceMouseUp" @mousedown.left="clearColoredHighlights">
      <svg id="arrows" :style="boardSizeStyle" viewBox="0 0 100 100">
        <template v-for="arrow in arrows">
          <polygon :class="['arrow', arrow.color]" :transform="arrow.transform" :points="arrow.points"></polygon>
        </template>
      </svg>
      <div class="row" v-for="i in indexArray">
        <BoardSquare v-for="j in indexArray" :index="i*10+j" :style="{ ...squareSizeStyle, cursor: dragging >= 11 ? 'grab' : 'default' }" :squareData="store.board[i*10+j]">
          <template v-if="getPiece(i*10+j) !== undefined">
            <Teleport to="body" v-if="dragging == i*10+j">
              <BoardPiece
                class="dragging"
                :piece="getPiece(i*10+j)!"
                :style="{ ...squareSizeStyle, left: `${pieceLeft}px`, top: `${pieceTop}px` }"
              />
            </Teleport>
            <BoardPiece
              v-else
              :piece="getPiece(i*10+j)!"
            ></BoardPiece>  
          </template>
        </BoardSquare>
        <div class="endRow"></div>
      </div>
      <div id="labels" :style="boardSizeStyle">
        <div id="ranks" :style="{ width: `${squareSize}px`, height: `${boardSize}px` }">
          <div v-for="rank in indexArray" :style="{ height: `${squareSize}px`, fontSize: `${labelFontSize}px` }">
            {{ 9 - rank }}
          </div>
        </div>
        <div id="files" :style="{ width: `${boardSize}px` }">
          <div v-for="file in indexArray" :style="{ width: `${squareSize}px`, fontSize: `${labelFontSize}px`, left: `${squareSize * (flipped ? (9 - file - 1) : (file - 1))}px` }">
            {{ String.fromCharCode('a'.charCodeAt(0) + file - 1) }}
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
          <a-button size="small" type="dashed" @click="flipped = !flipped">
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
      class="promotionModal"
      :visible="promotionModalVisible"
      :footer="null"
      :closable="false"
      title="Choose promotion piece"
    >
      <a-space>
        <a-button @click="setPromotionPiece(PIECE_TYPE.QUEEN)">
          <img src="img/pieces/wq.png" width="75" height="75">
        </a-button>
        <a-button @click="setPromotionPiece(PIECE_TYPE.ROOK)">
          <img src="img/pieces/wr.png" width="75" height="75">
        </a-button>
        <a-button @click="setPromotionPiece(PIECE_TYPE.KNIGHT)">
          <img src="img/pieces/wn.png" width="75" height="75">
        </a-button>
        <a-button @click="setPromotionPiece(PIECE_TYPE.BISHOP)">
          <img src="img/pieces/wb.png" width="75" height="75">
        </a-button>
      </a-space>
    </a-modal>
  </div>
</template>
