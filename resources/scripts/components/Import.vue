<script setup lang="ts">
import { ref, reactive, toRaw } from 'vue';
import type { UnwrapRef } from 'vue';
import { ImportOutlined } from '@ant-design/icons-vue';
import { useBoardStore } from '@/stores/board';

const store = useBoardStore();
const { loadPGN } = store;

interface FormState {
  code: string;
};

const formState: UnwrapRef<FormState> = reactive({
    code: ''
});

const visible = ref<boolean>(false);

const onSubmit = () => {
    const { code } = toRaw(formState);
    loadPGN(code);
    visible.value = false;
};

</script>

<template>
    <a-button @click="visible = true" block>
        <template #icon>
            <ImportOutlined />
        </template>
        Import
    </a-button>
    <a-modal v-model:visible="visible" title="Import" :footer="null">
        <a-form layout="vertical" :model="formState">
            <a-form-item  label="Paste FEN or PGN below">
                <a-textarea :rows="10" v-model:value="formState.code" />
            </a-form-item>
            <a-form-item>
                <a-button type="primary" @click="onSubmit">Import</a-button>
            </a-form-item>
        </a-form>        
    </a-modal>
</template>