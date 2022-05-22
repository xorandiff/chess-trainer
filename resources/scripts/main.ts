import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import Main from "./Main.vue";

const app = createApp(Main);

app.use(createPinia());

import { useAuthStore } from './stores/auth';

router.beforeEach(async (to, from) => {
    const authStore = useAuthStore();
    const userData = await authStore.getUserData();

    if (to.name !== 'Guest' && !authStore.isLoggedIn) {
        return { name: 'Guest' };
    }
});

app.use(router);

app.mount("#app");
