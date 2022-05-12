<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';

interface FormState {
  username: string;
  password: string;
  remember: boolean;
};

const formState = reactive<FormState>({
    username: '',
    password: '',
    remember: true,
});

const onFinish = (values: any) => {
    console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
};

const disabled = computed(() => {
    return !(formState.username && formState.password);
});

const isRegistration = ref(false);
</script>

<template>
    <a-row type="flex" justify="center" align="middle" :style="{ height: '100vh' }">
        <a-col>
            <a-card title="Login">
                <a-form
                    :model="formState"
                    id="loginForm"
                    @finish="onFinish"
                    @finishFailed="onFinishFailed"
                    hideRequiredMark
                >
                    <a-form-item
                        label="Username"
                        name="username"
                        :rules="[{ required: true, message: 'Please input your username!' }]"
                    >
                        <a-input v-model:value="formState.username">
                            <template #prefix>
                                <UserOutlined />
                            </template>
                        </a-input>
                    </a-form-item>

                    <a-form-item
                        label="Password"
                        name="password"
                        :rules="[{ required: true, message: 'Please input your password!' }]"
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
                    >
                        <a-input-password />
                    </a-form-item>

                    <div id="loginFormWrap">
                        <a-form-item name="remember" no-style>
                            <a-checkbox v-model:checked="formState.remember">Remember me</a-checkbox>
                        </a-form-item>
                        <a href="">Forgot password</a>
                    </div>

                    <a-form-item>
                        <a-button :disabled="disabled" type="primary" html-type="submit" id="loginFormButton">
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
