<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ImportOutlined } from '@ant-design/icons-vue';
import { useBoardStore } from "@/stores/board";

interface FormState {
  code: string;
};

const formState = reactive<FormState>({
    code: ''
});

const onFinish = (values: any) => {
    console.log('Success:', values);
    visible.value = false;
};

const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
};

const visible = ref<boolean>(false);

const store = useBoardStore();

</script>

<template>
    <a-button @click="visible = true">
        <template #icon>
            <ImportOutlined />
        </template>
        Import
    </a-button>
    <a-modal v-model:visible="visible" title="Import" :footer="null">
        <a-form layout="vertical" :model="formState" @finish="onFinish" @finishFailed="onFinishFailed">
            <a-form-item 
                label="Paste FEN or PGN below"
                :rules="[{ required: true, message: 'Please provide your FEN/PGN code' }]"
            >
                <a-textarea v-model:value="formState.code" />
            </a-form-item>
            <a-form-item>
                <a-button type="primary" html-type="submit">Submit</a-button>
            </a-form-item>
        </a-form>        
    </a-modal>
</template>