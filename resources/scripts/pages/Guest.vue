<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const store = useAuthStore();

const { login, register } = store;

interface FormState {
  email: string;
  password: string;
  password_confirmation: string;
  name: string;
  remember: boolean;
};

const formState = reactive<FormState>({
    email: '',
    password: '',
    password_confirmation: '',
    name: '',
    remember: true,
});

const isRegistration = ref(false);
const isLoading = ref(false);

const onFinish = async (values: any) => {
    axios.defaults.withCredentials = true;

    isLoading.value = true;

    if (isRegistration.value) {
        const apiResponse = await register(values.name, values.email, values.password, values.password_confirmation);
        if (apiResponse.error) {
            message.error('Registration failed');
        } else {
            message.success('Registration successfull, now you can login');
            isRegistration.value = false;
        }
        isLoading.value = false;
    } else {
        const loginResult = await login(values.email, values.password, values.remember);
        router.push({ name: 'app' });
        if (!loginResult) {
            message.error('Login failed. Incorrect email and/or password');
            isLoading.value = false;
        }
    }
};

const disabled = computed(() => {
    if (isRegistration.value === true) {
        return !(formState.email && formState.password && formState.name && formState.password_confirmation);
    } else {
        return !(formState.email && formState.password);
    }
});
</script>

<template>
    <a-row type="flex" justify="center" align="middle" :style="{ height: '100vh' }">
        <a-col>
            <a-card title="Login">
                <a-form
                    :model="formState"
                    id="loginForm"
                    @finish="onFinish"
                    hideRequiredMark
                >
                    <a-form-item 
                        v-if="isRegistration"
                        label="Name"
                        name="name"
                        :rules="[{ required: true, message: 'Please input your name' }]"
                    >
                        <a-input v-model:value="formState.name"/>
                    </a-form-item>

                    <a-form-item
                        label="E-mail"
                        name="email"
                        :rules="[{ required: true, message: 'Please input your email' }]"
                    >
                        <a-input v-model:value="formState.email">
                            <template #prefix>
                                <UserOutlined />
                            </template>
                        </a-input>
                    </a-form-item>

                    <a-form-item
                        label="Password"
                        name="password"
                        :rules="[{ required: true, message: 'Please input your password' }]"
                    >
                        <a-input-password v-model:value="formState.password">
                            <template #prefix>
                                <LockOutlined />
                            </template>
                        </a-input-password>
                    </a-form-item>

                    <a-form-item 
                        v-if="isRegistration"
                        label="Confirm"
                        name="password_confirmation"
                        :rules="[{ required: true, message: 'Please confirm your password' }]"
                    >
                        <a-input-password v-model:value="formState.password_confirmation"/>
                    </a-form-item>

                    <div v-if="!isRegistration" id="loginFormWrap">
                        <a-form-item name="remember" no-style>
                            <a-checkbox v-model:checked="formState.remember">Remember me</a-checkbox>
                        </a-form-item>
                        <a href="">Forgot password</a>
                    </div>

                    <a-form-item>
                        <a-button :disabled="disabled" type="primary" html-type="submit" id="loginFormButton" :loading="isLoading">
                            {{ isRegistration ? 'Register' : 'Log in' }}
                        </a-button>
                        <template v-if="isRegistration">
                            Back to <a @click="isRegistration = false">logging in</a>
                        </template>
                        <template v-else>
                            Or <a @click="isRegistration = true">register now!</a>
                        </template>
                    </a-form-item>
                </a-form>
            </a-card>
        </a-col>
    </a-row>
</template>
