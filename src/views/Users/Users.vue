<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import IconButton from '@/components/UI/Button/IconButton.vue'
import InputField from '@/components/UI/Inputs/InputField.vue'
import {Trash, ALargeSmall, Lock} from 'lucide-vue-next'
import Spinner from '@/components/UI/Spinner.vue'
import VisibilityToggle from '@/components/VisibilityToggle.vue'

const router = useRouter()
const authStore = useAuthStore()
const users = ref([])
const loading = ref(false)
const error = ref(null)
const showRegisterForm = ref(false)
const newUser = ref({
  username: '',
  password: '',
  role: 'player'
})

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const fetchUsers = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await axios.get(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    users.value = response.data
  } catch (err) {
    console.error('Ошибка при загрузке пользователей:', err)
    error.value = 'Не удалось загрузить пользователей'
    if (err.response?.status === 401) {
      authStore.logout()
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
}

const createUser = async () => {
  try {
    loading.value = true
    const response = await axios.post(`${API_URL}/users`, newUser.value, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    users.value.push(response.data)
    showRegisterForm.value = false
    newUser.value = { username: '', password: '', role: 'player' }
  } catch (err) {
    console.error('Ошибка при создании пользователя:', err)
    error.value = err.response?.data?.error || 'Не удалось создать пользователя'
  } finally {
    loading.value = false
  }
}

const deleteUser = async (userId, event) => {
  event.stopPropagation()
  if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return
  
  try {
    await axios.delete(`${API_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    users.value = users.value.filter(user => user.id !== userId)
  } catch (err) {
    console.error('Ошибка при удалении пользователя:', err)
    error.value = err.response?.data?.error || 'Не удалось удалить пользователя'
  }
}

const viewUser = (id) => {
  router.push(`/users/${id}`)
}

// Проверка, можно ли удалить пользователя
const canDeleteUser = (user) => {
  // Текущий пользователь - мастер
  const isMaster = authStore.user?.role === 'master'
  // Это не текущий пользователь
  const isNotSelf = user.id !== authStore.user?.id
  // Пользователь для удаления не мастер
  const isNotMaster = user.role !== 'master'
  
  return isMaster && isNotSelf && isNotMaster
}

onMounted(fetchUsers)
</script>

<template>
  <div class="container mx-auto p-4 text-white font-mono">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Пользователи</h1>
      <button
        @click="showRegisterForm = !showRegisterForm"
        class="px-4 py-2 bg-gray-800 border border-gray-600 hover:border-blue-600 rounded-lg font-medium transition-colors"
        v-if="authStore.user?.role === 'master'"
      >
        {{ showRegisterForm ? 'Отмена' : 'Создать пользователя' }}
      </button>
    </div>
    
    <!-- Форма создания пользователя -->
    <div v-if="showRegisterForm" class="bg-gray-800 rounded-lg p-4 mb-6">
      <h2 class="text-xl font-bold mb-4">Создать нового пользователя</h2>
      <form @submit.prevent="createUser" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Имя пользователя</label>
          <InputField 
           v-model="newUser.username"
          placeholder="Имя пользователя"
          :icon="ALargeSmall"/>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Пароль</label>
          <InputField 
          v-model="newUser.password"
          type="password"
          placeholder="Пароль"
          :icon="Lock"/>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Роль</label>
          <select
            v-model="newUser.role"
            class="flex-1 block w-full pl-3 pr-4 py-3 rounded-xl transition-all duration-300 outline-none
              bg-gray-800 focus:bg-gray-900
              focus:outline-none focus:ring-4 ffocus:border-transparent px-1"
              >
            <option value="player">Игрок</option>
            <option value="master">Мастер</option>
          </select>

        </div>
        <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
        <button
          type="submit"
          class="px-4 py-2 bg-gray-800 border border-gray-600 hover:border-blue-600 rounded-lg font-medium transition-colors"
          :disabled="loading"
        >
          Создать
        </button>
      </form>
    </div>
    
    <!-- Список пользователей -->
    <div v-if="loading" class="flex justify-center items-center h-screen">
      <Spinner size="huge"/>
    </div>

    <div v-else-if="error" class="bg-red-500 text-white p-4 rounded mb-4">
      {{ error }}
    </div>
    
    <div v-else-if="users.length === 0" class="text-center py-8 text-gray-400">
      Пользователи не найдены
    </div>
    
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <VisibilityToggle 
        v-for="user in users" 
        :key="user.id"
        :content-id="`user-${user.id}`"
          content-type="user"
        class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors relative"
      >
        <div @click="viewUser(user.id)" class="cursor-pointer">
          <h2 class="text-xl font-bold">{{ user.username }}</h2>
          <p class="text-gray-400 mt-1">{{ user.role === 'master' ? 'Мастер' : 'Игрок' }}</p>
          <p class="text-xs text-gray-500 mt-2">
            Создан: {{ new Date(user.created_at).toLocaleDateString() }}
          </p>
                  <!-- Кнопка удаления -->
         <IconButton 
            class="absolute hover:border-red-500 hover:text-red-500 bottom-2 right-2 p-1"
            @click="deleteUser(user.id, $event)"
            title="Удалить пользователя"
            v-if="canDeleteUser(user)"
          >
          <Trash class="w-4 h-4"/>
         </IconButton>
        </div>
        

      </VisibilityToggle>
    </div>
  </div>
</template>