<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { LoadingOutlined } from '@ant-design/icons-vue';
import { useBoardStore } from "@/stores/board";
import { PIECE_TYPE } from "@/enums";

const store = useBoardStore();

const { variations, engineWorking, currentMoveIndex } = storeToRefs(store);

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
        v-if="variations.length > 0"
        :column="1" 
        size="small" 
        :contentStyle="{ padding: '2px 10px' }" 
        bordered
    >
        <a-descriptions-item v-for="(variation, n) in variations" :labelStyle="variation.eval >= 0 ? labelStyleWhite : labelStyleBlack" >
            <template #label>
                <LoadingOutlined v-if="engineWorking" />
                <span class="variationLabel" v-else>
                    {{ variation.mate ? `M${Math.abs(variation.eval)}` : (variation.eval > 0 ? `+${variation.eval}` : variation.eval) }}
                </span>
            </template>
            <a-spin :spinning="engineWorking">
                <span class="moveNumber">
                    {{ Math.floor((currentMoveIndex + 1) / 2) + 1 }}{{ currentMoveIndex % 2 ? '.' : '...' }}
                </span>
                <template v-for="(move, index) in variation.moves">
                    <span class="moveNumber">
                        {{ index && (currentMoveIndex + index) % 2 ? `${Math.floor(((currentMoveIndex + 1) + index) / 2) + 1}.` : '' }}
                    </span>
                    <a-button class="moveButton" type="text">
                        <template #icon v-if="variation.pieces[move.to].toLowerCase() != 'p'">
                            <span :class="`chessFont f-${variation.pieces[move.to].toLowerCase()}${index % 2 ? 'w' : 'b'}`"></span>
                        </template>
                        {{ move.algebraicNotation }}
                    </a-button>
                </template>
            </a-spin>
        </a-descriptions-item>
    </a-descriptions>
</template>