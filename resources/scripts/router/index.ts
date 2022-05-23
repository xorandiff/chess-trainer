import { createRouter, createWebHistory } from 'vue-router';
import axios from 'axios';
import App from '@/App.vue';
import Guest from '@/pages/Guest.vue';
import Profile from "@/Profile.vue";
import Openings from "@/Openings.vue";
import Analysis from "@/Analysis.vue";
import Play from "@/Play.vue";
import Puzzle from "@/Puzzle.vue";
import BotSelection from "@/components/BotSelection.vue";
import SurvivalSelection from "@/components/SurvivalSelection.vue";

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
                name: 'play',
                path: 'play',
                component: Play,
                children: [
                    {
                        name: 'bot',
                        path: 'bot',
                        component: BotSelection
                    }
                ]
            },
            {
                name: 'puzzle',
                path: 'puzzle',
                component: Puzzle,
                children: [
                    {
                        name: 'survival',
                        path: 'survival',
                        component: SurvivalSelection
                    }
                ]
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

axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response.status === 401 || error.response.status === 419) {
            router.push({ name: 'login' });
        }
        return Promise.reject(error.response);
    }
);

export default router;