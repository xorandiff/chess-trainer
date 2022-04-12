<script setup lang="ts">
import { ref } from "vue";
import Chessboard from "./components/Chessboard.vue";
import Movelist from "./components/Movelist.vue";
import PlayingMode from "./components/PlayingMode.vue";

const activeKey = ref("1");
</script>

<template>
    <a-row>
        <a-col :span="14">
            <Chessboard :size="650" />
        </a-col>
        <a-col :span="10">
            <a-tabs v-model:activeKey="activeKey">
                <a-tab-pane key="1">
                    <template #tab>
                        <span>
                            Moves
                        </span>
                    </template>
                    <Movelist />
                </a-tab-pane>
            </a-tabs>
            <br/>
            <PlayingMode />
        </a-col>
    </a-row>
</template>