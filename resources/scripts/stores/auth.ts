import { defineStore } from "pinia";
import axios from 'axios';
import { message } from 'ant-design-vue';

axios.defaults.withCredentials = true;

export const useAuthStore = defineStore({
    id: 'auth',
    state: () => ({
        isLoggedIn: false,
        user: {
            name: '',
            email: '',
            emailVerified: false
        }
    }),
    actions: {
        async login(email: string, password: string, remember: boolean) {
            const loginData = {
                email,
                password,
                remember
            };

            try {
                await axios.get('/sanctum/csrf-cookie');
                await axios.post('/login', loginData);

                this.isLoggedIn = true;
                return true;
            } catch (error) {
                console.log(error);
                return false;
            }
        },
        async logout() {
            try {
                await axios.get('/sanctum/csrf-cookie');
                await axios.get('/api/logout');

                this.isLoggedIn = false;
            } catch (error) {
                console.log(error);
                message.error('Logging out failed');
            }
        },
        async register(name: string, email: string, password: string, password_confirmation: string) : Promise<ApiResponse> {
            const registrationData = {
                name,
                email,
                password,
                password_confirmation
            };

            try {
                await axios.get('/sanctum/csrf-cookie');
                const response = await axios.post('/register', registrationData);

                if (response.data.error) {
                    return { data: {}, error: 'Registration failed' };
                } else {
                    return { data: response.data };
                }
            } catch (error) {
                console.log(error);
                return { data: {}, error: 'Registration failed' };
            }
        },
        async getUserData() {
            try {
                await axios.get('/sanctum/csrf-cookie');
                const response = await axios.get('/api/users/auth');

                this.user.name = response.data.data.name;
                this.user.email = response.data.data.email;
                this.user.emailVerified = response.data.data.emailVerified;
                this.isLoggedIn = true;

                return { data: response.data };
            } catch (error) {
                return { data: {}, error: 'Not logged in' };
            }            
        }
    }
});