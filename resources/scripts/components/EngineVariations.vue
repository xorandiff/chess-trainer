<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { LoadingOutlined } from '@ant-design/icons-vue';
import { useBoardStore } from "@/stores/board";
const store = useBoardStore();
const { variations } = storeToRefs(store);
</script>

<template>
    <LoadingOutlined v-if="store.engineWorking" />
    <div class="variation" v-else v-for="variation in variations">
        <div class="variationMove" v-for="variationMove in variation">
            {{ variationMove.moveNumber }}. 
            <span v-if="variationMove.chessFontClass[0] != 'p'" :class="`chessFont f-${variationMove.chessFontClass}`"></span>
             {{ variationMove.from }} {{ variationMove.to }}
        </div>
    </div>
</template>