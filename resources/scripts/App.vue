<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { UserOutlined, ReadOutlined, SearchOutlined, SettingOutlined, LogoutOutlined, DesktopOutlined, RobotOutlined, BuildOutlined, FireOutlined } from '@ant-design/icons-vue';
import { useAuthStore } from './stores/auth';

const store = useAuthStore();
const router = useRouter();
const route = useRoute();

const { logout } = store;

const selectedKeys = ref([route.name]);

const onClick = (e: any) => {
  if (e.key) {
    router.push({ name: e.key });
  }
};
</script>

<template>
  <a-layout>
    <a-layout-sider width="140" :style="{ height: '100vh' }">
      <a-menu v-model:selectedKeys="selectedKeys" @click="onClick">
        <a-menu-item key="profile">
          <template #icon><user-outlined /></template>
          Profile
        </a-menu-item>
        <a-sub-menu key="play">
          <template #icon><desktop-outlined /></template>
          <template #title>Play</template>
          <a-menu-item key="bot">
            <template #icon><robot-outlined /></template>
            Bot
          </a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="puzzle">
          <template #icon><build-outlined /></template>
          <template #title>Puzzle</template>
          <a-menu-item key="survival">
            <template #icon><fire-outlined /></template>
            Survival
          </a-menu-item>
        </a-sub-menu>
        <a-menu-item key="openings">
          <template #icon><read-outlined /></template>
          Openings
        </a-menu-item>
        <a-menu-item key="analysis">
          <template #icon><search-outlined /></template>
          Analysis
        </a-menu-item>
        <a-sub-menu>
          <template #icon><setting-outlined /></template>
          <template #title>Settings</template>
          <a-menu-item key="login" @click="logout">
            <template #icon><logout-outlined /></template>
            Logout
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-content :style="{ margin: '16px 16px 0' }">
        <a-card :bordered="false">
          <router-view></router-view>
        </a-card>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
