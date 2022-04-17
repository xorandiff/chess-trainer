<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { LoadingOutlined } from '@ant-design/icons-vue';
import { useBoardStore } from "@/stores/board";
import { useEngineStore } from "@/stores/engine";
import { PIECE_TYPE, PIECE_COLOR } from "@/enums";

const boardStore = useBoardStore();
const engineStore = useEngineStore();

const { variations, movesLength, engineWorking } = storeToRefs(boardStore);
const { evalFormat } = storeToRefs(engineStore);
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
                <template v-if="variation[0].piece.color === PIECE_COLOR.BLACK">
                    {{ Math.floor(movesLength / 2) + 1 }}... 
                </template>
                <template v-for="(move, index) in variation">
                    <template v-if="move.piece.color === PIECE_COLOR.WHITE">
                        {{ Math.floor((movesLength + index) / 2) + 1 }}. 
                    </template>
                    <a-button class="moveButton" type="text" :style="{ marginLeft: move.piece.color === PIECE_COLOR.BLACK ? '-7px': '0' }">
                        <template #icon v-if="move.piece.type !== PIECE_TYPE.PAWN">
                            <span :class="`chessFont f-${move.piece.type}${move.piece.color}`"></span>
                        </template>
                        {{ move.algebraicNotation }}
                    </a-button>
                </template>
            </a-space>
        </a-descriptions-item>
    </a-descriptions>
</template>