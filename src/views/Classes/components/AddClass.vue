<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const name = ref('');
const description = ref('');
const hitDice = ref('');
const parentClassId = ref(null);
const isSubclass = ref(false);
const error = ref('');

const addClass = async () => {
  error.value = '';
  
  try {
    const response = await axios.post('http://localhost:5000/api/classes', {
      name: name.value,
      description: description.value,
      hit_dice: hitDice.value,
      parent_class_id: parentClassId.value,
      is_subclass: isSubclass.value
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Класс создан:', response.data);
    router.push('/classes');
  } catch (err) {
    console.error('Ошибка:', {
      request: err.config,
      response: err.response?.data,
      message: err.message
    });
    error.value = err.response?.data?.error || 'Ошибка при создании класса';
  }
};
</script>

<template>
  <div class="p-4 max-w-md mx-auto">
    <h2 class="text-2xl font-bold mb-4">Добавить класс</h2>
    
    <div v-if="error" class="mb-4 p-2 bg-red-100 text-red-700 rounded">
      {{ error }}
    </div>
    
    <form @submit.prevent="addClass" class="space-y-4">
      <div>
        <label for="name" class="block mb-1">Имя класса*</label>
        <input
          v-model="name"
          type="text"
          id="name"
          class="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label for="description" class="block mb-1">Описание</label>
        <textarea
          v-model="description"
          id="description"
          class="w-full p-2 border rounded"
        ></textarea>
      </div>

      <div>
        <label for="hitDice" class="block mb-1">Кость хитов (например, d8)</label>
        <input
          v-model="hitDice"
          type="text"
          id="hitDice"
          class="w-full p-2 border rounded"
          placeholder="d8"
        />
      </div>

      <div class="flex items-center">
        <input
          v-model="isSubclass"
          type="checkbox"
          id="isSubclass"
          class="mr-2"
        />
        <label for="isSubclass">Это подкласс?</label>
      </div>

      <div v-if="isSubclass">
        <label for="parentClassId" class="block mb-1">ID родительского класса</label>
        <input
          v-model.number="parentClassId"
          type="number"
          id="parentClassId"
          class="w-full p-2 border rounded"
          min="1"
        />
      </div>

      <button
        type="submit"
        class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Создать класс
      </button>
    </form>
  </div>
</template>