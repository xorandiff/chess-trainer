<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useBoardStore } from "@/stores/board";
import { useEngineStore } from "@/stores/engine";
import Import from "@/components/Import.vue";
import Export from "@/components/Export.vue";

const boardStore = useBoardStore();
const engineStore = useEngineStore();
const { switchAlwaysStockfish, switchStockfish, newGame } = boardStore;
const { setStockfishConfig } = engineStore;
const { stockfish, response } = storeToRefs(engineStore);
</script>

<template>
    <a-list bordered>
        <a-list-item>
            ECO {{ boardStore.eco ? boardStore.eco : '-' }}
        </a-list-item>
        <a-list-item>
            <a-row :style="{ width: '100%' }" :gutter="5">
                <a-col>
                    <Import />
                </a-col>
                <a-col>
                    <Export />
                </a-col>
            </a-row>
        </a-list-item>
        <a-list-item>
            <a-row :style="{ width: '100%' }" :gutter="10">
                <a-col :span="12">
                    Stockfish playing both sides <a-switch :checked="boardStore.alwaysStockfish" @click="switchAlwaysStockfish" />
                </a-col>
                <a-col :span="12">
                    Stockfish playing black <a-switch :checked="boardStore.stockfish" @click="switchStockfish" />
                </a-col>
            </a-row>
        </a-list-item>
        <a-list-item>
            <a-row :style="{ width: '100%' }" :gutter="5">
                <a-col :span="7">
                    Stockfish Skill Level <a-input-number v-model:value="stockfish.config.skill" :step="1" :min="0" :max="20" @change="(value: number) => setStockfishConfig({ skill: value })" />
                </a-col>
                <a-col :span="10">
                    Stockfish desired depth 
                    <a-input-number v-model:value="stockfish.config.depth" :step="1" :min="1" :max="35" @change="(value: number) => setStockfishConfig({ depth: value })">
                    </a-input-number>
                </a-col>
                <a-col :span="8">
                    <template v-if="boardStore.alwaysStockfish || boardStore.stockfish">
                        Stockfish Depth {{ response.depth }}
                    </template>
                </a-col>
            </a-row>
        </a-list-item>
    </a-list>
</template>