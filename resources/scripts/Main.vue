<script setup lang="ts">
import { message } from 'ant-design-vue';
import { useBoardStore } from "@/stores/board";
import { useEngineStore } from "@/stores/engine";
import { usePuzzleStore } from "@/stores/puzzle";

const handleError = (error: unknown) => {
  if (typeof error == 'string') {
    message.error(error);
  } else {
    console.log(error);
  }
};

useBoardStore().$onAction(({ onError }) => onError(handleError));
useEngineStore().$onAction(({ onError }) => onError(handleError));
usePuzzleStore().$onAction(({ onError }) => onError(handleError));

</script>

<template>
  <router-view></router-view>
</template>

<style lang="less">
@import "../../node_modules/ant-design-vue/dist/antd.dark.less";
</style>

<style lang="scss">
@import "./assets/base.scss";
</style>
