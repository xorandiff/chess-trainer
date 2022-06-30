<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { storeToRefs } from 'pinia';
import { SettingOutlined, RetweetOutlined, ExpandAltOutlined } from '@ant-design/icons-vue';
import { PIECE_TYPE, HIGHLIGHT_COLOR, MOVE_MARK } from "@/enums";
import { useBoardStore } from "@/stores/board";
import Eval from "./Eval.vue";
import _ from 'lodash';

import BookIcon from "@/components/icons/BookIcon.vue";
import BrilliantMoveIcon from "@/components/icons/BrilliantMoveIcon.vue";
import GreatMoveIcon from "@/components/icons/GreatMoveIcon.vue";
import BestMoveIcon from "@/components/icons/BestMoveIcon.vue";
import ExcellentMoveIcon from "@/components/icons/ExcellentMoveIcon.vue";
import GoodMoveIcon from "@/components/icons/GoodMoveIcon.vue";
import InaccuracyIcon from "@/components/icons/InaccuracyIcon.vue";
import MistakeIcon from "@/components/icons/MistakeIcon.vue";
import BlunderIcon from "@/components/icons/BlunderIcon.vue";

const boardScale = ref<number>(1);

const pieceLeft = ref(0);
const pieceTop = ref(0);


const store = useBoardStore();
const { flipped, currentMove, report, showEvaluation, currentMoveIndex, moves, arrows, promotionModalVisible, dragging, highlights, activeIndex, visibleLegalMoves } = storeToRefs(store);
const { pieceMouseUp, showMove, setPromotionPiece, clearColoredHighlights, pieceMoveFromActive, pieceMouseDown, setArrowFrom, setArrowTo } = store;

const orderedRow = computed(() => flipped.value ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8]);
const indexArray = computed(() => flipped.value ? _.range(63, -1) : _.range(0, 64));

const pieces = computed(() => moves.value[currentMoveIndex.value].pieces);

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
    <div 
      id="chessboard" 
      :class="{ dragging: dragging >= 0 }" 
      @mouseup.left="pieceMouseUp" 
      @mousedown.left="clearColoredHighlights" 
      :style="{ transform: `scale(${boardScale})` }"
    >
      <template v-for="n in indexArray">
        <div 
          v-if="pieces[n] && dragging != n"
          :class="`piece ${pieces[n] >= 'a' && pieces[n] <= 'z' ? 'b' : 'w'}${pieces[n].toLowerCase()}`"
          :style="{ transform: `translateX(${((flipped ? 63 - n : n) % 8) * 100}%) translateY(${((flipped ? 63 - n : n) / 8 >> 0) * 100}%)` }"
        >
          <div class="pieceMarkIcon" v-if="report.enabled && currentMove.mark && currentMove.to === n">
            <BookIcon v-if="currentMove.mark == MOVE_MARK.BOOK" :size="50" />
            <BrilliantMoveIcon v-if="currentMove.mark == MOVE_MARK.BRILLIANT" :size="50" />
            <GreatMoveIcon v-if="currentMove.mark == MOVE_MARK.GREAT_MOVE" :size="50" />
            <BestMoveIcon v-if="currentMove.mark == MOVE_MARK.BEST_MOVE" :size="50" />
            <ExcellentMoveIcon v-if="currentMove.mark == MOVE_MARK.EXCELLENT" :size="50" />
            <GoodMoveIcon v-if="currentMove.mark == MOVE_MARK.GOOD" :size="50" />
            <InaccuracyIcon v-if="currentMove.mark == MOVE_MARK.INACCURACY" :size="50" />
            <MistakeIcon v-if="currentMove.mark == MOVE_MARK.MISTAKE" :size="50" />
            <BlunderIcon v-if="currentMove.mark == MOVE_MARK.BLUNDER" :size="50" />
          </div>
        </div>
      </template>

      <svg id="arrows" viewBox="0 0 100 100">
        <polygon 
          v-for="arrow in arrows" 
          :class="['arrow', arrow.color]" 
          :transform="arrow.transform" 
          :points="arrow.points"
        ></polygon>
      </svg>

      <div 
        v-for="n in indexArray" 
        :class="['square', { highlight: activeIndex === n }]"
        :style="{ cursor: pieces[n] ? 'grab' : 'default' }"
        @mousedown.left="pieceMouseDown(n)"
        @mouseup.left="pieceMoveFromActive(n)"
        @click.right.prevent
        @mousedown.right="setArrowFrom(n)"
        @mouseup.right.exact="setArrowTo(n, HIGHLIGHT_COLOR.RED)"
        @mouseup.right.ctrl="setArrowTo(n, HIGHLIGHT_COLOR.ORANGE)"
        @mouseup.right.shift="setArrowTo(n, HIGHLIGHT_COLOR.GREEN)"
        @mouseup.right.alt="setArrowTo(n, HIGHLIGHT_COLOR.BLUE)"
      >
        <div v-show="highlights[n] !== HIGHLIGHT_COLOR.NONE" :class="['highlight', highlights[n]]"></div>
        <div v-show="visibleLegalMoves.includes(n)" :class="pieces[n] ? 'capture' : 'move'"></div>
      </div>

      <div id="labels">
        <div id="ranks">
          <div v-for="rank in orderedRow">
            {{ 9 - rank }}
          </div>
        </div>
        <div id="files">
          <div 
            v-for="file in orderedRow" 
            :style="{ left: `${12.5 * (flipped ? (9 - file - 1) : (file - 1))}%` }"
          >
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

    <Teleport v-if="dragging >= 0" to="body">
      <div
        :class="`piece ${pieces[dragging] == pieces[dragging].toLowerCase() ? 'b' : 'w'}${pieces[dragging].toLowerCase()}`"
        :style="{ left: `${pieceLeft}px`, top: `${pieceTop}px` }"
      ></div>
    </Teleport>

    <a-modal
      class="promotionModal"
      :visible="promotionModalVisible"
      :footer="null"
      :closable="false"
      title="Choose promotion piece"
    >
      <a-space>
        <a-button @click="setPromotionPiece(PIECE_TYPE.QUEEN)">
          <div class="promotionPiece wq"></div>
        </a-button>
        <a-button @click="setPromotionPiece(PIECE_TYPE.ROOK)">
          <div class="promotionPiece wr"></div>
        </a-button>
        <a-button @click="setPromotionPiece(PIECE_TYPE.KNIGHT)">
          <div class="promotionPiece wn"></div>
        </a-button>
        <a-button @click="setPromotionPiece(PIECE_TYPE.BISHOP)">
          <div class="promotionPiece wb"></div>
        </a-button>
      </a-space>
    </a-modal>
  </div>
</template>
