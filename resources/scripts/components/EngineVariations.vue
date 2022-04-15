<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { LoadingOutlined } from '@ant-design/icons-vue';
import { useBoardStore } from "@/stores/board";
import { useEngineStore } from "@/stores/engine";
import { PIECE_TYPE, PIECE_COLOR } from "@/enums";

const store = useBoardStore();
const engine = useEngineStore();
const { variations, movesLength } = storeToRefs(store);
const { response } = storeToRefs(engine);
</script>

<template>
    <div class="variation" v-for="variation in variations">
        <div :class="['variationEval', response.eval >= 0 ? 'white' : 'black']">
            <LoadingOutlined v-if="store.engineWorking"/>
            <span v-else>{{ response.eval }}</span>
        </div>
        <div class="variationMoves" v-if="!store.engineWorking">
            <div class="variationMove" v-for="(fullmove, index) in variation">
                {{ !fullmove[PIECE_COLOR.WHITE] ? `${movesLength + index}... ` : `${movesLength + index + 1}. ` }}

                <template v-if="fullmove[PIECE_COLOR.WHITE]">
                    <span v-if="fullmove[PIECE_COLOR.WHITE]!.piece.type !== PIECE_TYPE.PAWN" :class="`chessFont f-${fullmove[PIECE_COLOR.WHITE]!.piece.type}w`"></span>
                    {{ fullmove[PIECE_COLOR.WHITE]?.algebraicNotation }}
                </template>

                <span v-if="fullmove[PIECE_COLOR.BLACK]!.piece.type !== PIECE_TYPE.PAWN" :class="`chessFont f-${fullmove[PIECE_COLOR.BLACK]!.piece.type}b`"></span>
                {{ fullmove[PIECE_COLOR.BLACK]?.algebraicNotation }}
            </div>
        </div>
    </div>
</template>