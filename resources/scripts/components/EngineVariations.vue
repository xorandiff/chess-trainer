<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { LoadingOutlined } from '@ant-design/icons-vue';
import { useBoardStore } from "@/stores/board";
import { useEngineStore } from "@/stores/engine";
import { PIECE_TYPE, PIECE_COLOR } from "@/enums";

const store = useBoardStore();
const engine = useEngineStore();

const { variations, movesLength, engineWorking } = storeToRefs(store);
const { evalFormat } = storeToRefs(engine);
</script>

<template>
    <a-descriptions 
        :column="1" 
        size="small" 
        :contentStyle="{ padding: '2px 10px' }" 
        bordered
    >
        <a-descriptions-item v-for="variation in variations" :labelStyle="{ width: '50px', textAlign: 'center', padding: '0' }" >
            <template #label>
                <LoadingOutlined v-if="engineWorking" />
                <span class="variationLabel" v-else>
                    {{ evalFormat(false, true, true) }}
                </span>
            </template>
            <a-space>
                <span v-for="(fullmove, index) in variation">
                    {{ !fullmove[PIECE_COLOR.WHITE] ? `${movesLength + index}... ` : `${movesLength + index + 1}. ` }}
                    <a-button class="moveButton" v-if="fullmove[PIECE_COLOR.WHITE]" type="text">
                        <template #icon v-if="fullmove[PIECE_COLOR.WHITE]!.piece.type !== PIECE_TYPE.PAWN">
                            <span :class="`chessFont f-${fullmove[PIECE_COLOR.WHITE]!.piece.type}w`"></span>
                        </template>
                        {{ fullmove[PIECE_COLOR.WHITE]!.algebraicNotation }}
                    </a-button>
                    <a-button class="moveButton" v-if="fullmove[PIECE_COLOR.BLACK]" type="text">
                        <template #icon v-if="fullmove[PIECE_COLOR.BLACK]!.piece.type !== PIECE_TYPE.PAWN">
                            <span :class="`chessFont f-${fullmove[PIECE_COLOR.BLACK]!.piece.type}b`"></span>
                        </template>
                        {{ fullmove[PIECE_COLOR.BLACK]!.algebraicNotation }}
                    </a-button>
                </span>
            </a-space>
        </a-descriptions-item>
    </a-descriptions>
</template>