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
        title="Choose bot difficulty" 
        @ok="handleOk" 
        :closable="false" 
        :maskClosable="false" 
        :footer="null"
        :style="{ width: '37%' }"
    >
        <a-space direction="vertical" :size="45">
            <a-row :gutter="[48,8]">
                <a-col :span="8">
                    <a-button size="large">Newbie</a-button>
                </a-col>
                <a-col :span="8">
                    <a-button size="large">Beginner</a-button>
                </a-col>
                <a-col :span="8">
                    <a-button size="large">Intermediate</a-button>
                </a-col>
            </a-row>
            <a-row :gutter="[48,8]">
                <a-col :span="8">
                    <a-button size="large">Advanced</a-button>
                </a-col>
                <a-col :span="8">
                    <a-button size="large">Expert</a-button>
                </a-col>
                <a-col :span="8">
                    <a-button size="large">Grandmaster</a-button>
                </a-col>
            </a-row>
        </a-space>
    </a-modal>
</template>