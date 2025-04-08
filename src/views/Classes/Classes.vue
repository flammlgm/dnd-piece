<template>
  <div v-if="classData" class="p-6 bg-gray-800 text-white rounded-lg shadow-lg">
    <h1 class="text-3xl font-bold mb-4">{{ classData.name }}</h1>
    <p><strong>Описание:</strong> {{ classData.description || 'Нет описания' }}</p>
    <p><strong>Кость хитов:</strong> {{ classData.hit_dice }}</p>
    <p><strong>Класс-потомок:</strong> {{ classData.is_subclass ? 'Да' : 'Нет' }}</p>
  </div>

  <div v-else class="text-center text-white">
    Загружаем данные...
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const classData = ref(null);

onMounted(async () => {
  try {
    // Запрос на сервер, чтобы получить данные по классу с id=1
    const response = await axios.get('http://localhost:5000/api/classes/1');
    classData.value = response.data;
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  }
});
</script>