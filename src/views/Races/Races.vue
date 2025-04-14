<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import ImageButton from '@/components/UI/Button/ImageButton.vue'
const router = useRouter();
const races = ref([]);

const fetchRaces = async () => {
  try {
    const { data } = await axios.get('http://localhost:5000/api/races');
    races.value = data.sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
    console.error('Ошибка при загрузке рас:', err);
    alert('Не удалось загрузить расы');
  }
};

const goToRace = (id) => {
  router.push(`/races/${id}`);
};

const addNewRace = () => {
  router.push('/races/new'); 
};

onMounted(fetchRaces);
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-white font-bold text-5xl m-10">Расы</h1>
    <div class="container mx-auto p-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ImageButton 
        v-for="race in races"
        :key="race.id"
        :image="race.image_path"
        :text="race.name"
        :objectPosition="race.image_position"
        @click="goToRace(race.id)"
      />
    </div>
  </div>
  </div>
</template>


