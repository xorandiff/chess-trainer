<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { LoadingOutlined } from '@ant-design/icons-vue';
import { useBoardStore } from "@/stores/board";
import { PIECE_TYPE, PIECE_COLOR } from "@/enums";
const store = useBoardStore();
const { variations, moves } = storeToRefs(store);
</script>

<template>
    <LoadingOutlined v-if="store.engineWorking" />
    <div class="variation" v-else v-for="variation in variations">
        <div class="variationMove" v-for="(fullmove, index) in variation">
            <template v-if="fullmove[PIECE_COLOR.BLACK] && !fullmove[PIECE_COLOR.WHITE]">
                {{ moves.length + index }}... 
                <span v-if="fullmove[PIECE_COLOR.BLACK]!.piece.type !== PIECE_TYPE.PAWN" :class="`chessFont f-${fullmove[PIECE_COLOR.BLACK]!.piece.type}b`"></span>
                {{ fullmove[PIECE_COLOR.BLACK]?.algebraicNotation }}
            </template>
            <template v-else-if="fullmove[PIECE_COLOR.BLACK] && fullmove[PIECE_COLOR.WHITE]">
                {{ moves.length + index + 1 }}. 

                <span v-if="fullmove[PIECE_COLOR.WHITE]!.piece.type !== PIECE_TYPE.PAWN" :class="`chessFont f-${fullmove[PIECE_COLOR.WHITE]!.piece.type}w`"></span>
                {{ fullmove[PIECE_COLOR.WHITE]?.algebraicNotation }}

                <span v-if="fullmove[PIECE_COLOR.BLACK]!.piece.type !== PIECE_TYPE.PAWN" :class="`chessFont f-${fullmove[PIECE_COLOR.BLACK]!.piece.type}b`"></span>
                {{ fullmove[PIECE_COLOR.BLACK]?.algebraicNotation }}
            </template>
        </div>
    </div>
</template>