<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const router = useRouter();
const store = useAuthStore();

store.$subscribe((mutation, state) => {
  if (state.isLoggedIn) {
    router.push('/');
  } else {
    router.push('/login');
  }
});
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
