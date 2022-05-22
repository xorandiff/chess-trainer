<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { PIECE_COLOR, PIECE_TYPE, GAME_RESULT, MOVE_MARK } from "@/enums";
import { useBoardStore } from "@/stores/board";

const store = useBoardStore();

const { moves, currentMoveIndex, result } = storeToRefs(store);
const { showMove } = store;
</script>

<template>
    <a-descriptions :column="1" size="small" bordered>
        <a-descriptions-item>
            <a-row justify="start" :gutter="16">
                <span v-for="(move, index) in moves">
                    <span class="moveNumber" v-if="move.piece.color === PIECE_COLOR.WHITE">
                        {{ Math.floor(index / 2) + 1 }}. 
                    </span>
                    <question-circle-outlined v-if="move.mark == MOVE_MARK.MISTAKE" />
                    <a-button class="moveButton" :type="currentMoveIndex === index ? 'dashed' : 'text'" @click="showMove(index)" :style="{ borderColor: currentMoveIndex === index ? 'yellow' : '' }">
                        <template #icon v-if="move.piece.type != PIECE_TYPE.PAWN && !move.algebraicNotation.includes('O') && !move.promotionType">
                            <span :class="`chessFont f-${move.piece.type}${move.piece.color}`"></span>
                        </template>
                        {{ move.algebraicNotation.replace(/[QRKBN]/g, '') }}
                        <span v-if="move.promotionType" :class="`chessFont f-${move.promotionType}${move.piece.color}`"></span>
                    </a-button>
                </span>
                <span class="gameResult" v-if="result">
                    <span v-if="result === GAME_RESULT.WHITE_WON">1-0</span>
                    <span v-if="result === GAME_RESULT.BLACK_WON">0-1</span>
                    <span v-if="result === GAME_RESULT.DRAW">1/2-1/2</span>
                </span>
            </a-row>
        </a-descriptions-item>
    </a-descriptions>
</template>