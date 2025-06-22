<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import ImageButton from '@/components/UI/Button/ImageButton.vue';
import VisibilityToggle from '@/components/VisibilityToggle.vue';

const router = useRouter();
const authStore = useAuthStore();
const roles = ref([]);
const visibilitySettings = ref({});

const fetchRoles = async () => {
  try {
    const { data } = await axios.get('http://localhost:5000/api/roles');
    roles.value = data.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error('Ошибка при загрузке ролей:', err);
    alert('Не удалось загрузить роли');
  }
};

const fetchVisibilitySettings = async () => {
  try {
    const { data } = await axios.get('http://localhost:5000/api/visibility');
    visibilitySettings.value = data;
  } catch (err) {
    console.error('Ошибка при загрузке настроек видимости:', err);
  }
};

// Фильтруем роли по видимости
const visibleRoles = computed(() => {
  if (!authStore.user) return [];
  
  return roles.value.filter(role => {
    const settings = visibilitySettings.value[`role-${role.id}`];
    
    // Мастер видит все
    if (authStore.user.role === 'master') return true;
    
    // Если нет настроек - показываем всем
    if (!settings) return true;
    
    // Проверяем, есть ли текущий пользователь в списке тех, кому видно
    return settings.hidden_for_users.includes(authStore.user.id);
  });
});

const goToRole = (id) => {
  router.push(`/roles/${id}`);
};

const addNewRole = () => {
  router.push('/roles/new'); 
};

onMounted(async () => {
  await fetchRoles();
  await fetchVisibilitySettings();
});
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center">
      <h1 class="text-white font-bold text-5xl m-10">Роли</h1>
      <!-- <button 
        v-if="authStore.user?.role === 'master'"
        @click="addNewRole"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mr-10"
      >
        Добавить роль
      </button> -->
    </div>
    
    <div class="container mx-auto p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[200px]">
        <VisibilityToggle
          v-for="role in roles"
          :key="role.id"
          :content-id="`role-${role.id}`"
          content-type="role"
        >
          <ImageButton 
            :image="role.image_path"
            :text="role.name"
            :objectPosition="role.image_position"
            @click="goToRole(role.id)"
            class="h-full"
          />
        </VisibilityToggle>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Анимация для плавного появления элементов */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>