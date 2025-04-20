<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Spinner from '@/components/UI/Spinner.vue'
import { useAuthStore } from '@/stores/auth'
import { Plus, Trash, Edit } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const userId = route.params.id

const user = ref(null)
const characters = ref([])
const loading = ref(true)
const error = ref(null)
const showCreateForm = ref(false)
const newCharacter = ref({
  name: '',
  class_id: null,
  race_id: null
})

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const fetchData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const userRes = await axios.get(`${API_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    user.value = userRes.data;
    
    const charsRes = await axios.get(`${API_URL}/characters`, {
      params: { user_id: userId },
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    characters.value = charsRes.data.data || charsRes.data || [];
    
  } catch (err) {
    console.error('Ошибка загрузки:', err);
    error.value = err.response?.data?.error || 
                 err.response?.data?.message || 
                 'Не удалось загрузить данные';
  } finally {
    loading.value = false;
  }
};
const createCharacter = async () => {
  try {
    const response = await axios.post(`${API_URL}/characters`, {
      name: newCharacter.value.name,
      user_id: userId,
      class_name: '',
      race_name: '',
      level: 1,
      alignment: '',
      background: '',
      stats: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      }
    });
    characters.value.push(response.data);
    showCreateForm.value = false;
    newCharacter.value = { name: '' };
  } catch (err) {
    console.error('Ошибка создания:', err);
    error.value = err.response?.data?.error || 'Ошибка при создании персонажа';
  }
};

const deleteCharacter = async (id) => {
  if (!confirm('Удалить персонажа?')) return
  try {
    await axios.delete(`${API_URL}/characters/${id}`)
    characters.value = characters.value.filter(c => c.id !== id)
  } catch (err) {
    console.error('Ошибка удаления:', err)
    error.value = err.response?.data?.error || 'Ошибка при удалении персонажа'
  }
}

const isMaster = () => {
  return authStore.user?.role === 'master'
}

onMounted(fetchData)
</script>

<template>
  <div class="container mx-auto p-4 text-white font-mono">
    <div v-if="loading" class="flex justify-center items-center h-screen">
      <Spinner size="huge"/>
    </div>

    <div v-else-if="error" class="bg-red-500 text-white p-4 rounded mb-4">
      {{ error }}
    </div>

    <div v-else-if="user" class="space-y-6">
      <!-- Информация о пользователе -->
      <div class="bg-gray-800 rounded-lg p-6 mb-6">
        <h1 class="text-3xl font-bold mb-2">
          {{ user.username || 'Без имени' }}
        </h1>
        <p class="text-xl" :class="user.role === 'master' ? 'text-purple-400' : 'text-blue-400'">
          {{ user.role === 'master' ? 'Мастер' : 'Игрок' }}
        </p>
        <p v-if="user.created_at" class="text-sm text-gray-400 mt-2">
          Зарегистрирован: {{ new Date(user.created_at).toLocaleDateString() }}
        </p>
      </div>

      <!-- Кнопка создания персонажа -->
      <button
        v-if="isMaster()"
        @click="showCreateForm = !showCreateForm"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg mb-6 transition-colors"
      >
        <Plus :size="18" />
        {{ showCreateForm ? 'Отмена' : 'Создать персонажа' }}
      </button>

      <!-- Форма создания персонажа -->
      <div v-if="showCreateForm" class="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 class="text-xl font-bold mb-4">Новый персонаж</h2>
        <form @submit.prevent="createCharacter" class="space-y-4">
          <div>
            <label class="block mb-2 text-sm font-medium">Имя персонажа</label>
            <input
              v-model="newCharacter.name"
              required
              class="w-full p-2 bg-gray-700 border border-gray-600 rounded"
            />
          </div>
          <!-- Другие поля формы... -->
          <button
            type="submit"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            Создать
          </button>
        </form>
      </div>

      <!-- Список персонажей -->
      <h2 class="text-2xl font-bold border-b border-gray-700 pb-2">
        Персонажи ({{ characters.length }})
      </h2>

      <div v-if="characters.length === 0" class="text-center py-8 text-gray-400 bg-gray-800 rounded-lg">
        Нет созданных персонажей
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="character in characters"
          :key="character.id"
          class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors border border-gray-700 relative"
        >
          <div @click="router.push(`/characters/${character.id}`)" class="cursor-pointer">
            <h2 class="text-xl font-bold">
              {{ character.name || 'Безымянный персонаж' }}
            </h2>
            <div class="mt-3 space-y-1">
              <p v-if="character.race_name" class="text-sm text-gray-300">
                <span class="text-gray-400">Раса:</span> {{ character.race_name }}
              </p>
              <p v-if="character.class_name" class="text-sm text-gray-300">
                <span class="text-gray-400">Класс:</span> {{ character.class_name }}
              </p>
            </div>
          </div>

          <!-- Кнопки управления -->
          <div v-if="isMaster()" class="absolute top-2 right-2 flex gap-2">
            <button
              @click.stop="router.push(`/characters/${character.id}?edit=true`)"
              class="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
              title="Редактировать"
            >
              <Edit :size="16" />
            </button>
            <button
              @click.stop="deleteCharacter(character.id)"
              class="p-1 text-gray-400 hover:text-red-400 transition-colors"
              title="Удалить"
            >
              <Trash :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>