<script setup lang="ts">
import { PIECE_TYPE } from "@/chessboard";
import { useBoardStore } from "@/stores/board";
import Piece from "./Piece.vue";

const store = useBoardStore();
const { board, color, pieceMouseUp, pieceMouseDown, pieceMoveFromActive, setPromotionPiece, setDraggedOver } = store;
</script>

<template>
  <div id="chessboard" @mouseup="pieceMouseUp" :class="color === 'b' ? 'flip' : ''">
    <div class="row" v-for="i in 8">
      <template v-for="j in 8">
        <div 
          class="square"
          :class="[board[i-1][j-1].active || board[i-1][j-1].highlight ? 'highlight' : '']"
          @drop="pieceMoveFromActive([i-1, j-1])"
          @dragenter.prevent
          @dragover="e => {e.preventDefault(); return setDraggedOver([i-1, j-1]);}"
        >
          <div v-if="board[i-1][j-1].active || board[i-1][j-1].draggedOver" class="active"></div>
          <div v-if="board[i-1][j-1].legalMove" :class="board[i-1][j-1].piece ? 'capture' : 'move'"></div>
          <Piece 
            v-if="board[i-1][j-1].piece"
            :piece="board[i-1][j-1].piece"
            :square="[i-1, j-1]"
            :flip="color === 'b'"
            @piece-mouse-down="pieceMouseDown([i-1, j-1])"
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
