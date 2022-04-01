<script setup lang="ts">
import { UserOutlined, ReadOutlined, SearchOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';
import Analysis from "./Analysis.vue";

const selectedKeys = ref<string[]>(['analysis']);
</script>

<template>
  <a-layout>
    <a-layout-sider>
      <a-menu v-model:selectedKeys="selectedKeys" mode="inline">
        <a-menu-item key="profile">
          <user-outlined />
          <span class="nav-text">Profile</span>
        </a-menu-item>
        <a-menu-item key="openings">
          <read-outlined />
          <span class="nav-text">Openings</span>
        </a-menu-item>
        <a-menu-item key="analysis">
          <search-outlined />
          <span class="nav-text">Analysis</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-content :style="{ margin: '24px 16px 0' }">
        <a-card :bordered="false">
          <Analysis />
        </a-card>
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        Chess Trainer ©2022
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<style lang="scss">
@import "./assets/base.scss";
</style>
