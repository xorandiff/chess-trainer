<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { LoadingOutlined } from '@ant-design/icons-vue';
import { useBoardStore } from "@/stores/board";
import { PIECE_TYPE, PIECE_COLOR } from "@/enums";

const store = useBoardStore();

const { variations, movesLength, engineWorking } = storeToRefs(store);

const labelStyleWhite = {
    width: '40px',
    textAlign: 'center',
    padding: '0px',
    backgroundColor: 'white',
    color: 'black'
}

const labelStyleBlack = {
    width: '40px',
    textAlign: 'center',
    padding: '0px',
    backgroundColor: '#403d39',
    color: 'white'
}

</script>

<template>
    <a-descriptions 
        :column="1" 
        size="small" 
        :contentStyle="{ padding: '2px 10px' }" 
        bordered
    >
        <a-descriptions-item v-for="variation in variations" :labelStyle="variation.eval >= 0 ? labelStyleWhite : labelStyleBlack" >
            <template #label>
                <LoadingOutlined v-if="engineWorking" />
                <span class="variationLabel" v-else>
                    {{ variation.mate ? `M${Math.abs(variation.eval)}` : (variation.eval > 0 ? `+${variation.eval}` : variation.eval) }}
                </span>
            </template>
            <a-spin :spinning="engineWorking">
                <a-space>
                    <template v-if="variation.moves[0] && variation.pieces[variation.moves[0].pieceIndex].color === PIECE_COLOR.BLACK">
                        {{ Math.floor(movesLength / 2) + 1 }}... 
                    </template>
                    <template v-for="(move, index) in variation.moves">
                        <template v-if="variation.pieces[move.pieceIndex].color === PIECE_COLOR.WHITE">
                            {{ Math.floor((movesLength + index) / 2) + 1 }}. 
                        </template>
                        <a-button class="moveButton" type="text" :style="{ marginLeft: variation.pieces[move.pieceIndex].color === PIECE_COLOR.BLACK ? '-7px': '0' }">
                            <template #icon v-if="variation.pieces[move.pieceIndex].type !== PIECE_TYPE.PAWN">
                                <span :class="`chessFont f-${variation.pieces[move.pieceIndex].type}${variation.pieces[move.pieceIndex].color}`"></span>
                            </template>
                            {{ move.algebraicNotation }}
                        </a-button>
                    </template>
                </a-space>
            </a-spin>
        </a-descriptions-item>
    </a-descriptions>
</template>