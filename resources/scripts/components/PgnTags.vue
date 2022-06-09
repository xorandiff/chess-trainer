<script setup lang="ts">
import { useBoardStore } from "@/stores/board";

const store = useBoardStore();

const { tags } = store.pgn;
</script>

<template>
    <a-form>
        <a-form-item>
            <a-input v-model:value="tags.white" placeholder="White player" />
        </a-form-item>
        <a-form-item>
            <a-input v-model:value="tags.black" placeholder="Black player" />
        </a-form-item>
        <a-form-item>
            <a-input v-model:value="tags.result" placeholder="Result" />
        </a-form-item>
        <a-form-item>
            <a-input v-model:value="tags.event" placeholder="Event" />
        </a-form-item>
        <a-form-item>
            <a-input v-model:value="tags.site" placeholder="Location" />
        </a-form-item>
        <a-form-item>
            <a-input v-model:value="tags.round" placeholder="Round" />
        </a-form-item>
        <a-form-item>
            <a-input v-model:value="tags.date" placeholder="Date" />
        </a-form-item>
    </a-form>
</template>