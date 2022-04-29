<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { ExportOutlined } from '@ant-design/icons-vue';
import { useBoardStore } from "@/stores/board";

const visible = ref<boolean>(false);
const activeKey = ref('fen');

const store = useBoardStore();
const { fen, pgn } = storeToRefs(store);

</script>

<template>
    <a-button @click="visible = true">
        <template #icon>
            <ExportOutlined />
        </template>
        Export
    </a-button>
    <a-modal v-model:visible="visible" title="Export" :footer="null" :height="200">
        <a-tabs v-model:activeKey="activeKey">
            <a-tab-pane class="exportImportTabPane" key="fen" tab="FEN">
                {{ fen }}
            </a-tab-pane>
            <a-tab-pane class="exportImportTabPane" key="pgn" tab="PGN" force-render>
                <a-textarea id="pgn" v-model:value="pgn.value" />
            </a-tab-pane>
        </a-tabs>
    </a-modal>
</template>