<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useBoardStore } from "@/stores/board";

const store = useBoardStore();
const { eco } = storeToRefs(store);
</script>

<template>
    <a-descriptions 
        :column="1" 
        size="small" 
        :labelStyle="{ padding: '0px 12px', width: '0px', textAlign: 'center' }" 
        bordered
    >
        <a-descriptions-item label="ECO">
            {{ eco }}
        </a-descriptions-item>
    </a-descriptions>
</template>