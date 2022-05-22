import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import Main from "./Main.vue";

const app = createApp(Main);

app.use(createPinia());

import { useAuthStore } from './stores/auth';

router.beforeEach(async (to, from) => {
    const authStore = useAuthStore();
    const authorized = await authStore.isLoggedIn();

    if (to.meta.requiresAuth && !authorized) {
        return { name: 'login' };
    } else if (to.name === 'login' && authorized) {
        return { name: 'app' };
    }
});

app.use(router);

app.mount("#app");
