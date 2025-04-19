<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import {Eye} from 'lucide-vue-next'

const props = defineProps({
  contentId: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    required: true
  }
});

const authStore = useAuthStore();
const isMaster = computed(() => authStore.user?.role === 'master');
const showDropdown = ref(false);
const allPlayers = ref([]);
const hiddenForUsers = ref([]);
const isLoading = ref(false);

// Получаем список всех игроков
const fetchPlayers = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/users');
    allPlayers.value = response.data.filter(user => user.role === 'player');
  } catch (error) {
    console.error('Failed to fetch players:', error);
  }
};

// Получаем текущие настройки видимости
const fetchVisibilitySettings = async () => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/visibility/${props.contentId}`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    );
    if (response.data) {
      hiddenForUsers.value = response.data.hidden_for_users || [];
    }
  } catch (error) {
    console.error('Failed to fetch visibility settings:', error);
  }
};

// Обновляем настройки видимости
const updateVisibilitySettings = async () => {
  isLoading.value = true;
  try {
    await axios.put(
      `http://localhost:5000/api/visibility/${props.contentId}`,
      {
        hiddenForUsers: hiddenForUsers.value,
        contentType: props.contentType
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    );
    showDropdown.value = false;
  } catch (error) {
    console.error('Failed to update visibility:', error);
  } finally {
    isLoading.value = false;
  }
};

// Проверяем, должен ли контент быть видимым для текущего пользователя
const isVisible = computed(() => {
  if (!authStore.user) return false;
  if (authStore.user.role === 'master') return true;
  return hiddenForUsers.value.includes(authStore.user.id);
});

// Переключаем видимость для конкретного игрока
const togglePlayerVisibility = (playerId) => {
  const index = hiddenForUsers.value.indexOf(playerId);
  if (index === -1) {
    hiddenForUsers.value.push(playerId);
  } else {
    hiddenForUsers.value.splice(index, 1);
  }
};

onMounted(async () => {
  await fetchPlayers();
  await fetchVisibilitySettings();
});
</script>

<template>
  <div v-if="isVisible" class="relative">   
    <button
      v-if="isMaster"
      @click="showDropdown = !showDropdown"
      class="absolute top-0 right-0 z-10 p-1 mr-3 mt-2 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition-colors"
      title="Управление видимостью"
    >
      <Eye class="w-5 h-5 hover:text-blue-700"/>
    </button>

    <!-- Унифицированное выпадающее меню -->
    <div
      v-if="showDropdown && isMaster"
      class="absolute top-10 right-0 z-20 bg-gray-800 border border-gray-600 p-4 rounded-lg shadow-xl"
    >
      <h3 class="font-bold mb-2 text-white">Кому виден этот блок:</h3>
      <div class="space-y-2 max-h-60 overflow-y-auto">
        <div
          v-for="player in allPlayers"
          :key="player.id"
          class="flex items-center"
        >
          <input
            :id="`player-${player.id}`"
            type="checkbox"
            :checked="hiddenForUsers.includes(player.id)"
            @change="togglePlayerVisibility(player.id)"
            class="w-4 h-4 rounded border-gray-300 text-blue-700 focus:ring-blue-600"
          />
          <label :for="`player-${player.id}`" class="ml-2 text-white">
            {{ player.username }}
          </label>
        </div>
      </div>
      <button
        @click="updateVisibilitySettings"
        :disabled="isLoading"
        class="mt-3 px-3 py-1 rounded-lg font-medium transition-colors bg-gray-800 border-2 w-full text-white border-gray-600 hover:border-blue-600"
      >
        {{ isLoading ? 'Сохранение...' : 'Сохранить' }}
      </button>
    </div>

    <slot />
  </div>
</template>

<style scoped>
/* Добавим плавную анимацию для меню */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>