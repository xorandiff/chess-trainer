import { createRouter, createWebHistory } from 'vue-router';
import App from '@/App.vue';
import Guest from '@/pages/Guest.vue';
import Profile from "@/Profile.vue";
import Openings from "@/Openings.vue";
import Analysis from "@/Analysis.vue";

const routes = [
    {
        path: '/',
        redirect: '/analysis',
        name: 'app',
        component: App,
        meta: {
            requiresAuth: true
        },
        children: [
            {
                name: 'profile',
                path: 'profile',
                component: Profile
            },
            {
                name: 'openings',
                path: 'openings',
                component: Openings
            },
            {
                name: 'analysis',
                path: 'analysis',
                component: Analysis
            }
        ]
    },
    {
        name: 'login',
        path: '/login',
        component: Guest,
        meta: {
            requiresAuth: false
        }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;