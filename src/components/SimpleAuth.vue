<!-- <script setup>
import { ref } from 'vue';
import axios from 'axios';
import { setAuthToken } from '@/utils/auth';

const username = ref('');
const password = ref('');
const error = ref('');

const login = async () => {
  try {
    const { data } = await axios.post('/api/auth/login', {
      username: username.value,
      password: password.value
    });
    setAuthToken(data.token);
    window.location.reload(); // Перезагружаем для обновления состояния авторизации
  } catch (err) {
    error.value = 'Неверные данные';
  }
};
</script>

<template>
  <div class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
    <div class="bg-gray-800 p-6 rounded-lg max-w-md w-full">
      <h2 class="text-xl font-bold mb-4">Вход для игроков</h2>
      
      <div class="space-y-4">
        <div>
          <label class="block mb-1">Логин:</label>
          <input v-model="username" type="text" class="w-full px-3 py-2 bg-gray-700 rounded">
        </div>
        
        <div>
          <label class="block mb-1">Пароль:</label>
          <input v-model="password" type="password" class="w-full px-3 py-2 bg-gray-700 rounded">
        </div>
        
        <div v-if="error" class="text-red-400 text-sm">{{ error }}</div>
        
        <button 
          @click="login"
          class="w-full bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded"
        >
          Войти
        </button>
      </div>
    </div>
  </div>
</template> -->