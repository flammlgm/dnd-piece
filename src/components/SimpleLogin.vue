<!-- <script setup>
import { ref } from 'vue';
import axios from 'axios';
import { setToken } from '@/utils/auth';

const username = ref('');
const password = ref('');
const error = ref('');

const login = async () => {
  try {
    const { data } = await axios.post('/api/auth/login', {
      username: username.value,
      password: password.value
    });
    setToken(data.token);
    window.location.reload(); // Перезагрузка для применения авторизации
  } catch {
    error.value = 'Ошибка входа';
  }
};
</script>

<template>
  <div class="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
    <div class="bg-gray-800 p-6 rounded-lg max-w-sm w-full">
      <h2 class="text-xl font-bold mb-4">Вход в систему</h2>
      <input 
        v-model="username" 
        placeholder="Логин" 
        class="w-full mb-3 p-2 bg-gray-700 rounded"
      >
      <input 
        v-model="password" 
        type="password" 
        placeholder="Пароль" 
        class="w-full mb-4 p-2 bg-gray-700 rounded"
      >
      <button 
        @click="login"
        class="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded"
      >
        Войти
      </button>
      <div v-if="error" class="text-red-400 mt-2">{{ error }}</div>
    </div>
  </div>
</template> -->