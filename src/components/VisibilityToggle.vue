<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

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
  return !hiddenForUsers.value.includes(authStore.user.id);
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
  <div class="relative">
    <!-- Кнопка управления (только для мастера) -->
    <button
      v-if="isMaster"
      @click="showDropdown = !showDropdown"
      class="absolute top-0 right-0 z-10 p-1 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition-colors"
      title="Управление видимостью"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    </button>

    <!-- Выпадающее меню с выбором игроков -->
    <div
      v-if="showDropdown && isMaster"
      class="absolute top-8 right-0 z-20 bg-white rounded-md shadow-lg p-4 w-64"
    >
      <h3 class="font-bold mb-2">Видимость для игроков:</h3>
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
            class="mr-2"
          />
          <label :for="`player-${player.id}`">{{ player.username }}</label>
        </div>
      </div>
      <button
        @click="updateVisibilitySettings"
        :disabled="isLoading"
        class="mt-3 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {{ isLoading ? 'Сохранение...' : 'Сохранить' }}
      </button>
    </div>

    <!-- Слот с контентом, который будет скрыт/показан -->
    <div v-if="isVisible">
      <slot />
    </div>
  </div>
</template>