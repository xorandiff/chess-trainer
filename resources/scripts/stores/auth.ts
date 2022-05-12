import { defineStore } from "pinia";

export const useAuthStore = defineStore({
    id: 'auth',
    state: () => ({
        isLoggedIn: false,
        username: ''
    }),
    actions: {
        
    }
});