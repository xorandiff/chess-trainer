<script setup lang="ts">
import { UserOutlined, ReadOutlined, SearchOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';
import Analysis from "./Analysis.vue";
import Openings from "./Openings.vue";
import Profile from "./Profile.vue";
import { useAuthStore } from './stores/auth';

const store = useAuthStore();
const { logout } = store;
const selectedKeys = ref<string[]>(['analysis']);
</script>

<template>
  <a-layout>
    <a-layout-sider width="140" :style="{ height: '100vh' }">
      <a-menu v-model:selectedKeys="selectedKeys">
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
        <a-sub-menu>
          <template #icon>
            <setting-outlined />
          </template>
          <template #title>Settings</template>
          <a-menu-item @click="logout">
            <template #icon>
              <logout-outlined />
            </template>
            Logout
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-content :style="{ margin: '16px 16px 0' }">
        <a-card :bordered="false">
          <Analysis v-if="selectedKeys.includes('analysis')" />
          <Openings v-if="selectedKeys.includes('openings')" />
          <Profile v-if="selectedKeys.includes('profile')" />
        </a-card>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
