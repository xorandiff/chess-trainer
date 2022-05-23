<script setup lang="ts">
import { ref } from 'vue';

const visible = ref<boolean>(true);

const handleOk = (e: MouseEvent) => {
    console.log(e);
    visible.value = false;
};
</script>

<template>
    <a-modal 
        v-model:visible="visible" 
        class="bigButtonsModal"
        title="Survival Puzzle" 
        @ok="handleOk" 
        :closable="false" 
        :maskClosable="false" 
        :footer="null"
        :style="{ width: '37%' }"
    >
        <a-row :gutter="8">
            <a-col :span="8">
                <a-button size="large">3 min</a-button>
            </a-col>
            <a-col :span="8">
                <a-button size="large">5 min</a-button>
            </a-col>
            <a-col :span="8">
                <a-button size="large">Unlimited</a-button>
            </a-col>
        </a-row>
    </a-modal>
</template>