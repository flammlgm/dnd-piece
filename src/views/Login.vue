<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import InputField from '@/components/UI/Inputs/InputField.vue'
import {User, Lock} from 'lucide-vue-next'

const authStore = useAuthStore();
const router = useRouter();
const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  try {
    await authStore.login(username.value, password.value);
    router.push('/');
  } catch (err) {
    error.value = typeof err === 'string' ? err : 
                 err.response?.data?.error || 
                 err.message || 
                 'Login failed. Please try again.';
    console.error('Login error details:', err);
  } finally {
    loading.value = false;
  }
};
</script>
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900">
    <div class="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-3xl font-bold font-mono mb-6 text-center text-white">Login</h1>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium font-mono text-gray-300 mb-2">Username</label>
          <InputField
            v-model="username"
            type="text"
            id="username"
            class="text-gray-300 font-mono"
            placeholder="Введите имя пользователя"
            :icon="User"
          />

        </div>
        <div>
          <label for="password" class="block text-sm font-medium font-mono text-gray-300 mb-2">Password</label>
          <InputField
            v-model="password"
            type="password"
            id="password"
            class="text-gray-300 font-mono"
            placeholder="Введите пароль"
            required
            :icon="Lock"
          />
        </div>
        <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
        <button
          type="submit"
          class="w-full flex justify-center py-2 px-4  rounded-lg  shadow-sm text-sm font-medium text-white bg-gray-800 border-2 border-gray-600 hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          :disabled="loading"
        >
          <span v-if="!loading">Login</span>
          <span v-else>Loading...</span>
        </button>
      </form>
      <div class="mt-4 text-center">
        <p class="text-sm text-gray-600">
          Don't have an account?
          <router-link to="/register" class="text-indigo-600 hover:text-indigo-500">Register</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

