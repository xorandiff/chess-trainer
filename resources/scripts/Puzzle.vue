<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from 'pinia';

import { useBoardStore } from "@/stores/board";
import { useEngineStore } from "@/stores/engine";

import Chessboard from "@/components/Chessboard.vue";
import Movelist from "@/components/Movelist.vue";
import OpeningCode from "@/components/OpeningCode.vue";

const boardStore = useBoardStore();
const engineStore = useEngineStore();
const { switchAlwaysStockfish, switchStockfish } = boardStore;
const { setStockfishConfig } = engineStore;
const { stockfish, response } = storeToRefs(engineStore);
</script>

<template>
    <a-row>
        <a-col>
            <Chessboard />
        </a-col>
        <a-col>
            <a-card>
                <a-space direction="vertical" :style="{ width: '100%' }">
                    <OpeningCode />
                    <Movelist />
                </a-space>
            </a-card>
        </a-col>
    </a-row>
    <router-view></router-view>
</template>