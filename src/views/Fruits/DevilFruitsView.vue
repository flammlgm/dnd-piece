<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Spinner from '@/components/UI/Spinner.vue';
import DevilFruitsList from './components/DevilFruitsList.vue';
import DevilFruitForm from './components/DevilFruitForm.vue';
import DevilFruitView from './components/DevilFruitView.vue';
import IconButton from '@/components/UI/Button/IconButton.vue';
import { Plus } from 'lucide-vue-next';
import {useAuthStore} from '@/stores/auth.js'

const authStore = useAuthStore()
const router = useRouter();

// Состояния данных
const fruits = ref([]);
const loading = ref(true);

// Состояния интерфейса
const isCreatingFruit = ref(false);
const isEditingFruit = ref(false);
const isViewingFruit = ref(false);
const selectedFruit = ref(null);
const editingFruit = ref(null);

const fruitTypes = ['Paramecia', 'Zoan', 'Logia'];
const rarityTypes = ['Uncommon', 'Rare', 'Very Rare', 'Legendary'];

// Загрузка данных
const fetchFruits = async () => {
  try {
    loading.value = true;
    const { data } = await axios.get('http://localhost:5000/api/devil-fruits');
    fruits.value = data;
  } catch (err) {
    console.error('Ошибка загрузки:', err);
  } finally {
    loading.value = false;
  }
};

// Основные действия
const createFruit = async (fruitData) => {
  try {
    const { data } = await axios.post('http://localhost:5000/api/devil-fruits', fruitData);
    fruits.value.push(data);
    isCreatingFruit.value = false;
  } catch (err) {
    console.error('Ошибка создания фрукта:', err);
  }
};

const updateFruit = async (fruitData) => {
  try {
    const { data } = await axios.put(
      `http://localhost:5000/api/devil-fruits/${fruitData.id}`,
      fruitData
    );
    
    const index = fruits.value.findIndex(f => f.id === data.id);
    if (index >= 0) {
      fruits.value[index] = data;
    }
    isEditingFruit.value = false;
  } catch (err) {
    console.error('Ошибка обновления фрукта:', err);
  }
};

const deleteFruit = async (id) => {
  if (confirm('Удалить фрукт?')) {
    try {
      await axios.delete(`http://localhost:5000/api/devil-fruits/${id}`);
      fruits.value = fruits.value.filter(fruit => fruit.id !== id);
    } catch (err) {
      console.error('Ошибка удаления фрукта:', err);
    }
  }
};

const viewFruit = (fruit) => {
  selectedFruit.value = fruit;
  isViewingFruit.value = true;
};

const startCreatingFruit = () => {
  editingFruit.value = {
    name: '',
    type: 'Paramecia',
    description: '',
    abilities: {
      rarity: 'Uncommon',
      features: [],
      awakening: ''
    },
    appearance: '',
    creature: {
      name: '',
      type: 'beast',
      size: 'Medium',
      ac: 10,
      hp: '1d10',
      speed: '30 ft',
      stats: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      },
      skills: '',
      abilities: []
    },
    water_vulnerability: true
  };
  isCreatingFruit.value = true;
};

const startEditingFruit = (fruit) => {
  editingFruit.value = JSON.parse(JSON.stringify(fruit));
  isEditingFruit.value = true;
  isViewingFruit.value = false;
};

const cancelFruitEdit = () => {
  isEditingFruit.value = false;
  isCreatingFruit.value = false;
  isViewingFruit.value = false;
};

onMounted(() => {
  fetchFruits();
});
</script>

<template>
  <div v-if="loading" class="flex justify-center items-center h-screen">
    <Spinner size="huge"/>
  </div>

  <div v-else class="devil-fruits-page bg-gray-900 text-white font-mono min-h-screen p-6">
    <div class="bg-gray-800 rounded-2xl p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-4xl font-bold">Дьявольские фрукты</h1>
        <IconButton @click="startCreatingFruit" v-if="authStore.user?.role === 'master'">
          <Plus/>
        </IconButton>
      </div>

      <DevilFruitForm 
        v-if="isCreatingFruit"
        :fruit="editingFruit"
        :fruitTypes="fruitTypes"
        :rarityTypes="rarityTypes"
        mode="create"
        @cancel="cancelFruitEdit"
        @save="createFruit"
      />

      <DevilFruitForm 
        v-if="isEditingFruit"
        :fruit="editingFruit"
        :fruitTypes="fruitTypes"
        :rarityTypes="rarityTypes"
        mode="edit"
        @cancel="cancelFruitEdit"
        @save="updateFruit"
      />

      <DevilFruitView 
        v-if="isViewingFruit"
        :fruit="selectedFruit"
        @edit="startEditingFruit"
        @delete="deleteFruit"
        @close="cancelFruitEdit"
        
      />

      <DevilFruitsList 
        :fruits="fruits"
        :fruitTypes="fruitTypes"
        :rarityTypes="rarityTypes"
        @view="viewFruit"
      />
    </div>
  </div>
</template>

<style scoped>
.devil-fruits-page {
  max-width: 1200px;
  margin: 0 auto;
}
</style>