<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { UserOutlined } from '@ant-design/icons-vue';
import { useAuthStore } from '@/stores/auth';

const store = useAuthStore();
const { user } = storeToRefs(store);

</script>

<template>
    <a-row>
        <a-col>
            <a-card>
                <a-avatar shape="square" :size="160">
                    <template #icon><UserOutlined /></template>
                </a-avatar>
                {{ user.name }}
            </a-card>
        </a-col>
    </a-row>
</template>