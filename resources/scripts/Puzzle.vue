<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from 'pinia';

import { useBoardStore } from "@/stores/board";
import { useEngineStore } from "@/stores/engine";

import Chessboard from "@/components/Chessboard.vue";

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
                <router-view></router-view>
            </a-card>
        </a-col>
    </a-row>
    
</template>