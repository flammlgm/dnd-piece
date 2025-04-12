<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const classId = parseInt(route.params.id);
const currentClass = ref(null);

const fetchClass = async () => {
  try {
    const { data } = await axios.get(`http://localhost:5000/api/classes/${classId}`);
    currentClass.value = data;
  } catch (err) {
    console.error('Ошибка при получении класса:', err);
  }
};

const editClass = () => {
  router.push(`/classes/edit/${classId}`);
};

const deleteClass = async () => {
  try {
    await axios.delete(`http://localhost:5000/api/classes/${classId}`);
    alert('Класс удалён!');
    router.push('/classes');
  } catch (err) {
    console.error('Ошибка при удалении класса:', err);
    alert('Ошибка при удалении класса');
  }
};

onMounted(fetchClass);
</script>

<template>
  <div v-if="currentClass" class="class-page bg-gray-900 text-white min-h-screen p-6">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-5xl font-bold mb-6">{{ currentClass.name }}</h1>
      <p class="mb-6">{{ currentClass.description || 'Нет описания' }}</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 class="text-2xl font-semibold mb-4">Основные характеристики:</h3>
          <table class="w-full text-left">
            <tr><td class="py-2 font-semibold">Кость хитов:</td><td>{{ currentClass.hit_dice || 'Не указано' }}</td></tr>
          </table>
        </div>
        
        <div v-if="currentClass.base_stats">
          <h3 class="text-2xl font-semibold mb-4">Базовые характеристики:</h3>
          <table class="w-full text-left">
            <tr v-for="(value, stat) in currentClass.base_stats" :key="stat">
              <td class="py-2 font-semibold capitalize">{{ stat }}:</td><td>{{ value }}</td>
            </tr>
          </table>
        </div>
      </div>

      <button @click="editClass" class="bg-blue-500 text-white px-6 py-3 rounded-md">Редактировать</button>
      <button @click="deleteClass" class="bg-red-500 text-white px-6 py-3 rounded-md ml-4">Удалить</button>
    </div>
  </div>
</template>