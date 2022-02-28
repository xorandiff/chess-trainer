import { fileURLToPath, URL } from "url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import laravel from "vite-plugin-laravel";

export default defineConfig({
  plugins: [vue(), vueJsx(), laravel()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./resources/scripts", import.meta.url)),
    },
  }
});
