<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const classes = ref([]);

const fetchClasses = async () => {
  try {
    const { data } = await axios.get('http://localhost:5000/api/classes');
    classes.value = data;
  } catch (err) {
    console.error('Ошибка при загрузке классов:', err);
    alert('Не удалось загрузить классы');
  }
};

const goToClass = (id) => {
  router.push(`/classes/${id}`);
};

const addNewClass = () => {
  router.push('/classes/new'); 
};

onMounted(fetchClasses);
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-white font-bold text-5xl m-10">Классы</h1>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="cls in classes" :key="cls.id" class="bg-gray-800 p-6 rounded-lg">
        <h2 class="text-xl font-semibold">{{ cls.name }}</h2>
        <p class="text-gray-400 mb-2">Кость хитов: {{ cls.hit_dice || 'd8' }}</p>
        <p class="text-gray-400 mb-4">{{ cls.description || 'Нет описания' }}</p>
        <button @click="goToClass(cls.id)" class="bg-blue-500 text-white px-4 py-2 rounded-md">
          Подробнее
        </button>
      </div>
    </div>
    <button @click="addNewClass" class="mt-6 bg-green-500 text-white px-6 py-3 rounded-md">
      Добавить новый класс
    </button>
  </div>
</template>


