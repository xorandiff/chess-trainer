<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useBoardStore } from "@/stores/board";

const router = useRouter();
const boardStore = useBoardStore();

const { loadAnalysisList } = boardStore;
const { savedAnalysis } = storeToRefs(boardStore);

const loading = ref(true);

onMounted(async () => {
    await loadAnalysisList();
    loading.value = false;
});

const columns = [
  {
    name: 'White',
    dataIndex: 'white',
    key: 'white',
  },
  {
    name: 'Black',
    dataIndex: 'black',
    key: 'black',
  },
  {
    name: 'Date',
    dataIndex: 'date',
    key: 'date',
  },
  {
    name: 'Event',
    dataIndex: 'event',
    key: 'event',
  },
  {
    name: 'Site',
    dataIndex: 'site',
    key: 'site',
  },
  {
    name: 'Action',
    key: 'action',
  }
];
</script>

<template>
    <a-table :columns="columns" :data-source="savedAnalysis" :loading="loading">
        <template #headerCell="{ column }">
            <span>
                {{ column.name }}
            </span>
        </template>
        <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'white'">
                <a>
                    {{ record.white }}
                </a>
            </template>
            <template v-if="column.key === 'black'">
                <a>
                    {{ record.black }}
                </a>
            </template>
            <template v-if="column.key === 'date'">
                <a>
                    {{ record.date }}
                </a>
            </template>
            <template v-if="column.key === 'event'">
                <a>
                    {{ record.event }}
                </a>
            </template>
            <template v-if="column.key === 'site'">
                <a>
                    {{ record.site }}
                </a>
            </template>
            <template v-else-if="column.key === 'action'">
                <span>
                    <a @click="router.push({ path: `/analysis/game/${record.id}` })">Open</a>
                    <a-divider type="vertical" />
                    <a>Delete</a>
                </span>
            </template>
        </template>
    </a-table>
</template>