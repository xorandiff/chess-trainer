import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import Main from "./Main.vue";

const app = createApp(Main);

app.use(createPinia());

import { useAuthStore } from './stores/auth';

router.beforeEach(async (to, from) => {
    if (to.meta.requiresAuth) {
        const authStore = useAuthStore();
        const authorized = await authStore.isLoggedIn();

        if (!authorized) {
            return { name: 'login' };
        }
    }
});

app.use(router);

app.mount("#app");
