import { fileURLToPath, URL } from "url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import laravel from "vite-plugin-laravel";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    laravel(),
    Components({
      resolvers: [
        AntDesignVueResolver()
      ]
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./resources/scripts", import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          'primary-color': '#FDC57B',
        }
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          antd: ['ant-design-vue']
        }
      }
    }
  }
});
