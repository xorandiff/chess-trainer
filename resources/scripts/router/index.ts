import { createRouter, createWebHistory } from 'vue-router';
import App from '@/App.vue';
import Guest from '@/pages/Guest.vue';

const routes = [
    {
        path: '/',
        name: 'App',
        component: App,
    },
    {
        path: '/login',
        name: 'Guest',
        component: Guest
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;