<script setup lang="ts">
import { UserOutlined } from '@ant-design/icons-vue';
</script>

<template>
    <a-row>
        <a-col>
            <a-card>
                <a-avatar shape="square" :size="160">
                    <template #icon><UserOutlined /></template>
                </a-avatar>
                Username
            </a-card>
        </a-col>
    </a-row>
</template>