<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { UserOutlined, ReadOutlined, SearchOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons-vue';
import { useAuthStore } from './stores/auth';

const store = useAuthStore();
const router = useRouter();
const route = useRoute();

const { logout } = store;

const selectedKeys = ref([route.name]);

const onSelect = (e: any) => {
  if (e.key) {
    router.push({ name: e.key });
  }
};
</script>

<template>
  <a-layout>
    <a-layout-sider width="140" :style="{ height: '100vh' }">
      <a-menu v-model:selectedKeys="selectedKeys" @select="onSelect">
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
          <a-menu-item key="login" @click="logout">
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
          <router-view></router-view>
        </a-card>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
