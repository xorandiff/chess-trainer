<script setup lang="ts">
import { ref } from "vue";
import Chessboard from "./components/Chessboard.vue";
import Movelist from "./components/Movelist.vue";
import PlayingMode from "./components/PlayingMode.vue";
import PGN from "./components/PGN.vue";
import Eval from "./components/Eval.vue";

const activeKey = ref("1");
</script>

<template>
    <a-row>
        <a-col :span="1">
            <Eval />
        </a-col>
        <a-col :span="12">
            <Chessboard />
        </a-col>
        <a-col :span="11">
            <a-tabs v-model:activeKey="activeKey">
                <a-tab-pane key="1">
                    <template #tab>
                        <span>
                            Moves
                        </span>
                    </template>
                    <Movelist />
                </a-tab-pane>
                <a-tab-pane key="2">
                    <template #tab>
                        <span>
                            PGN
                        </span>
                    </template>
                    <PGN />
                </a-tab-pane>
            </a-tabs>
            <br/>
            <PlayingMode />
        </a-col>
    </a-row>
</template>