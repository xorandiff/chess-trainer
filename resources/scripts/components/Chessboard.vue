<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { storeToRefs } from 'pinia';
import { SettingOutlined, RetweetOutlined, ExpandAltOutlined } from '@ant-design/icons-vue';
import { PIECE_TYPE } from "@/enums";
import { useBoardStore } from "@/stores/board";
import BoardPiece from "./BoardPiece.vue";
import BoardSquare from "./BoardSquare.vue";
import Eval from "./Eval.vue";

const boardScale = ref<number>(1);
const isMouseDown = ref<boolean>(false);
const flipped = ref<boolean>(false);

const pieceLeft = ref(0);
const pieceTop = ref(0);

const indexArray = computed(() => flipped.value ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8]);

const store = useBoardStore();
const { showEvaluation, currentMoveIndex, arrows, pieces, promotionModalVisible, dragging, occupiedSquares } = storeToRefs(store);
const { pieceMouseUp, setPromotionPiece, showMove, clearColoredHighlights } = store;

function handleMousemove(event: MouseEvent) {
  pieceLeft.value = event.pageX - 55;
  pieceTop.value = event.pageY - 55;
}

function handleMouseMoveScale(event: MouseEvent) {
  if (boardScale.value >= 0.5 && boardScale.value <= 1) {
    const d = event.movementY / 300;
    if (boardScale.value + d > 1) {
      boardScale.value = 1;
    } else if (boardScale.value + d < 0.5) {
      boardScale.value = 0.5;
    } else {
      boardScale.value += d;
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
  window.removeEventListener('mousemove', handleMouseMoveScale);
}

function handleMouseDown(event: MouseEvent) {
  window.addEventListener('mousemove', handleMouseMoveScale);
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
    <Eval v-if="showEvaluation" />
    <div id="chessboard" :class="{ dragging: dragging }" @mouseup.left="pieceMouseUp" @mousedown.left="clearColoredHighlights" :style="{ transform: `scale(${boardScale})` }">
      <BoardPiece v-for="piece in pieces" :posLeft="dragging === piece.square ? pieceLeft : 0" :posTop="dragging === piece.square ? pieceTop : 0" :piece="piece" />

      <svg id="arrows" viewBox="0 0 100 100">
        <template v-for="arrow in arrows">
          <polygon :class="['arrow', arrow.color]" :transform="arrow.transform" :points="arrow.points"></polygon>
        </template>
      </svg>

      <div class="row" v-for="i in indexArray">
        <BoardSquare v-for="j in indexArray" :index="i*10+j" :squareData="store.board[i*10+j]" :occupied="occupiedSquares.includes(i*10+j)" />
        <div class="endRow"></div>
      </div>

      <div id="labels">
        <div id="ranks">
          <div v-for="rank in indexArray">
            {{ 9 - rank }}
          </div>
        </div>
        <div id="files">
          <div v-for="file in indexArray" :style="{ left: `${12.5 * (flipped ? (9 - file - 1) : (file - 1))}%` }">
            {{ String.fromCharCode('a'.charCodeAt(0) + file - 1) }}
          </div>
        </div>
      </div>

    </div>
    <div id="sidebar">
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
            <a-button size="small" type="dashed" @mousedown="handleMouseDown">
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
