<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import ImageButton from '@/components/UI/Button/ImageButton.vue'
const router = useRouter();
const roles = ref([]);

const fetchRoles = async () => {
  try {
    const { data } = await axios.get('http://localhost:5000/api/roles');
    roles.value = data.sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
    console.error('Ошибка при загрузке ролей:', err);
    alert('Не удалось загрузить роли');
  }
};

const goToRole = (id) => {
  router.push(`/roles/${id}`);
};

// const addNewRace = () => {
//   router.push('/roles/new'); 
// };

onMounted(fetchRoles);
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-white font-bold text-5xl m-10">Роли</h1>
    <div class="container mx-auto p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ImageButton 
          v-for="role in roles"
          :key="role.id"
          :image="role.image_path"
          :text="role.name"
          :objectPosition="role.image_position"
          @click="goToRole(role.id)"
        />
      </div>
    </div>
  </div>
</template>


