<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const name = ref('');
const description = ref('');
const hitDice = ref('d8');
const baseStats = ref({
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10
});
const proficiencies = ref([]);
const features = ref([]);
const error = ref('');
// ============= НАЧАЛО НОВОГО КОДА =============
const imageFile = ref(null);
const imagePosition = ref('center');
const isSubclass = ref(false);
const parentClassId = ref(null);

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Проверка типа файла
    if (!file.type.match('image.*')) {
      error.value = 'Пожалуйста, загрузите изображение (JPEG, PNG, WebP)';
      return;
    }
    
    // Проверка размера файла (до 5MB)
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'Изображение должно быть меньше 5MB';
      return;
    }
    
    imageFile.value = file;
    error.value = '';
  }
};
// ============= КОНЕЦ НОВОГО КОДА =============

const addClass = async () => {
  error.value = '';
  
  // ============= НАЧАЛО НОВОГО КОДА =============
  const formData = new FormData();
  formData.append('name', name.value);
  formData.append('description', description.value);
  formData.append('hit_dice', hitDice.value);
  formData.append('base_stats', JSON.stringify(baseStats.value));
  formData.append('proficiencies', JSON.stringify(proficiencies.value));
  formData.append('features', JSON.stringify(features.value));
  formData.append('image_position', imagePosition.value);
  
  if (imageFile.value) {
    formData.append('image', imageFile.value);
  }
  
  if (isSubclass.value) {
    formData.append('parent_class_id', parentClassId.value);
  }
  // ============= КОНЕЦ НОВОГО КОДА =============

  try {
    const response = await axios.post('http://localhost:5000/api/classes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Class created:', response.data);
    router.push('/classes');
  } catch (err) {
    console.error('Error:', err);
    error.value = err.response?.data?.error || 'Error creating class';
  }
};
</script>

<template>
  <div class="p-4 max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold mb-4">Add Class</h2>
    
    <div v-if="error" class="mb-4 p-2 bg-red-100 text-red-700 rounded">
      {{ error }}
    </div>
    
    <form @submit.prevent="addClass" class="space-y-4">
      <div>
        <label for="name" class="block mb-1">Class Name*</label>
        <input
          v-model="name"
          type="text"
          id="name"
          class="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label for="description" class="block mb-1">Description</label>
        <textarea
          v-model="description"
          id="description"
          class="w-full p-2 border rounded"
        ></textarea>
      </div>

      <div>
        <label for="hitDice" class="block mb-1">Hit Dice (e.g. d8)</label>
        <input
          v-model="hitDice"
          type="text"
          id="hitDice"
          class="w-full p-2 border rounded"
          placeholder="d8"
        />
      </div>

      <div>
        <label for="image" class="block mb-1">Class Image</label>
        <input
          type="file"
          id="image"
          @change="handleImageUpload"
          accept="image/*"
          class="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label for="imagePosition" class="block mb-1">Image Position (e.g. "20% 30%")</label>
        <input
          v-model="imagePosition"
          type="text"
          id="imagePosition"
          class="w-full p-2 border rounded"
          placeholder="center"
        />
      </div>

      <div class="flex items-center">
        <input
          v-model="isSubclass"
          type="checkbox"
          id="isSubclass"
          class="mr-2"
        />
        <label for="isSubclass">Is subclass?</label>
      </div>

      <div v-if="isSubclass">
        <label for="parentClassId" class="block mb-1">Parent Class ID</label>
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
        Create Class
      </button>
    </form>
  </div>
</template>