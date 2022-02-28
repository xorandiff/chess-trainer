<script setup lang="ts">
import { useBoardStore } from "@/stores/board";
import { def } from "@vue/shared";
import Piece from "./Piece.vue";

const store = useBoardStore();
const { board, color, pieceMouseUp, pieceMouseDown, pieceMoveFromActive } = store;
</script>

<template>
  <div id="chessboard" @mouseup="pieceMouseUp" :class="color === 'b' ? 'flip' : ''">
    <div class="row" v-for="i in 8">
      <template v-for="j in 8">
        <div 
          class="square"
          :class="board[i-1][j-1].active ? 'active' : ''"
          @drop="pieceMoveFromActive([i-1, j-1])"
          @dragover.prevent
          @dragenter.prevent
        >
          <div v-if="board[i-1][j-1].legalMove" :class="board[i-1][j-1].piece ? 'capture' : 'move'"></div>
          <Piece 
            v-if="board[i-1][j-1].piece"
            :piece="board[i-1][j-1].piece"
            :square="[i-1, j-1]"
            :flip="color === 'b'"
            @piece-mouse-down="pieceMouseDown([i-1, j-1])"
          ></Piece>
        </div>
      </template>
    </div>
  </div>
</template>
