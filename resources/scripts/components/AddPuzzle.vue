<script setup lang="ts">
import { ref, reactive, toRaw } from 'vue';
import type { UnwrapRef } from 'vue';
import { ImportOutlined } from '@ant-design/icons-vue';
import { useBoardStore } from '@/stores/board';

const store = useBoardStore();
const { addNewPuzzle } = store;

interface FormState {
  pgn: string;
  rating: number;
};

const formState: UnwrapRef<FormState> = reactive({
    pgn: '',
    rating: 0
});

const visible = ref<boolean>(false);

const onSubmit = async () => {
    const { pgn, rating } = toRaw(formState);
    await addNewPuzzle(pgn, rating);
};

</script>

<template>
    <a-button @click="visible = true" block>
        <template #icon>
            <ImportOutlined />
        </template>
        Add new puzzle
    </a-button>
    <a-modal v-model:visible="visible" title="Add new puzzle to database" :footer="null">
        <a-form layout="vertical" :model="formState">
            <a-form-item label="Rating">
                <a-input-number v-model:value="formState.rating"></a-input-number>
            </a-form-item>
            <a-form-item  label="PGN">
                <a-textarea :rows="10" v-model:value="formState.pgn" />
            </a-form-item>
            <a-form-item>
                <a-button type="primary" @click="onSubmit">Add</a-button>
            </a-form-item>
        </a-form>        
    </a-modal>
</template>