<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import Spinner from '@/components/UI/Spinner.vue';
import IconButton from '@/components/UI/Button/IconButton.vue';
import InputField from '@/components/UI/Inputs/InputField.vue';
import VisibilityToggle from '@/components/VisibilityToggle.vue';
import { Pen, Trash, Save, X, ALargeSmall, Plus } from 'lucide-vue-next';
import draggable from 'vuedraggable';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const roleId = parseInt(route.params.id);

const currentRole = ref(null);
const loading = ref(true);
const isEditing = ref(false);

const editData = ref({
  name: '',
  description: '',
  features: [],
  image_path: '',
  image_position: ''
});

// Загрузка данных
const fetchData = async () => {
  try {
    loading.value = true;
    const { data } = await axios.get(`http://localhost:5000/api/roles/${roleId}`);
    currentRole.value = data;
    initEditData(data);
  } catch (err) {
    console.error('Ошибка загрузки:', err);
  } finally {
    loading.value = false;
  }
};

const initEditData = (data) => {
  editData.value = {
    ...data,
    features: Array.isArray(data.features) 
      ? data.features 
      : []
  };
};

const addFeature = () => {
  editData.value.features.push({
    id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: `Новая особенность ${editData.value.features.length + 1}`,
    description: '',
    order: editData.value.features.length
  });
};

const removeFeature = (index) => {
  editData.value.features.splice(index, 1);
  editData.value.features.forEach((f, idx) => f.order = idx);
};

const updateFeatureName = (index, newName) => {
  if (newName.trim() === '') return;
  editData.value.features[index].name = newName;
};

// Методы для перемещения особенностей
const moveFeatureUp = (index) => {
  if (index <= 0) return;
  
  const prevOrder = editData.value.features[index-1].order;
  editData.value.features[index-1].order = editData.value.features[index].order;
  editData.value.features[index].order = prevOrder;
  
  editData.value.features.sort((a, b) => a.order - b.order);
};

const moveFeatureDown = (index) => {
  if (index >= editData.value.features.length - 1) return;
  
  const nextOrder = editData.value.features[index+1].order;
  editData.value.features[index+1].order = editData.value.features[index].order;
  editData.value.features[index].order = nextOrder;
  
  editData.value.features.sort((a, b) => a.order - b.order);
};

// Основные действия
const editRole = () => {
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  initEditData(currentRole.value);
};

const saveRole = async () => {
  try {
    const dataToSend = JSON.parse(JSON.stringify({
      ...editData.value,
      features: editData.value.features.map((f, idx) => ({
        id: f.id || `temp-${idx}-${Date.now()}`,
        name: f.name || `Особенность ${idx + 1}`,
        description: f.description || '',
        order: idx
      }))
    }));

    const { data } = await axios.put(
      `http://localhost:5000/api/roles/${roleId}`,
      dataToSend,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        transformRequest: [(data) => JSON.stringify(data)]
      }
    );
    
    currentRole.value = data;
    isEditing.value = false;
  } catch (err) {
    console.error('Ошибка сохранения:', {
      request: err.config?.data,
      response: err.response?.data
    });
    alert(`Ошибка: ${err.response?.data?.error || err.message}`);
  }
};

const deleteRole = async () => {
  if (confirm('Удалить роль?')) {
    await axios.delete(`http://localhost:5000/api/roles/${roleId}`);
    router.push('/roles');
  }
};

const updateFeatureOrders = () => {
  editData.value.features.forEach((f, idx) => {
    f.order = idx;
  });
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div v-if="loading" class="flex justify-center items-center h-screen">
    <Spinner size="huge"/>
  </div>

  <div v-else-if="currentRole" class="role-page bg-gray-900 text-white font-mono min-h-screen p-6">
    <!-- Режим редактирования -->
    <div v-if="isEditing" class="bg-gray-800 rounded-2xl p-6 mb-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-4xl font-bold">Редактирование роли</h1>
        <div class="flex gap-2">
          <IconButton @click="saveRole" title="Сохранить">
            <Save class="w-5 h-5"/>
          </IconButton>
          <IconButton @click="cancelEdit" title="Отменить">
            <X class="w-5 h-5"/>
          </IconButton>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block mb-2">Название роли</label>
          <InputField v-model="editData.name" :icon="ALargeSmall"/>
        </div>
      </div>

      <div class="mb-6">
        <label class="block mb-2">Описание</label>
        <textarea
          v-model="editData.description"
          class="flex-1 block w-full h-32 pl-3 pr-4 py-3 rounded-xl transition-all duration-300 outline-none
              bg-gray-800 focus:bg-gray-900
              focus:outline-none focus:ring-4 ffocus:border-transparent px-1"
        ></textarea>
      </div>

      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-xl font-bold">Особенности</h3>
          <IconButton @click="addFeature" title="Добавить">
              <Plus class="w-5 h-5"/>
          </IconButton>
        </div>
        
        <draggable 
          v-model="editData.features"
          item-key="id"
          @end="updateFeatureOrders"
          handle=".drag-handle"
        >
          <template #item="{element, index}">
            <div class="mb-4 border border-gray-600 rounded p-3">
              <div class="flex items-center gap-2 mb-2">
                <button class="drag-handle cursor-grab">☰</button>
                <InputField
                  v-model="element.name"
                  placeholder="Название особенности"
                  class="flex-1"
                  :icon="ALargeSmall"
                />
                <IconButton @click="removeFeature(index)" title="Удалить">
                  <Trash class="w-4 h-4"/>
                </IconButton>
              </div>
              <textarea
                v-model="element.description"
                class="flex-1 block w-full h-32 pl-3 pr-4 py-3 rounded-xl transition-all duration-300 outline-none
                    bg-gray-800 focus:bg-gray-900
                    focus:outline-none focus:ring-4 ffocus:border-transparent px-1"
              ></textarea>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <!-- Режим просмотра -->
    <div v-else class="flex flex-col lg:flex-row gap-6 items-start">
      <!-- Боковая панель с изображением -->
      <div class="w-full lg:w-1/3 flex-shrink-0 lg:sticky lg:top-6 lg:self-start h-fit">
        <img 
          v-if="currentRole.image_path" 
          :src="currentRole.image_path" 
          alt="Изображение роли" 
          class="rounded-2xl w-full h-auto object-cover"
        />
      </div>
      
      <!-- Основной контент -->
      <div class="flex-1 bg-gray-800 rounded-2xl p-6 lg:p-10 w-full">
        <!-- Заголовок и кнопки -->
        <div class="flex justify-between items-start mb-6">

            <h1 class="text-4xl font-bold">{{ currentRole.name }}</h1>
          
          <div v-if="authStore.user?.role === 'master'" class="flex gap-2">
            <IconButton @click="editRole" title="Изменить роль">
              <Pen class="w-4 h-4"/>
            </IconButton>
            <!-- <IconButton @click="deleteRole" title="Удалить роль">
              <Trash class="w-4 h-4"/>
            </IconButton> -->
          </div>
        </div>

        <!-- Описание -->
        <VisibilityToggle
          :content-id="`role-${currentRole.id}-description`"
          content-type="role-description"
        >
          <div class="mb-8">
            <h3 class="text-2xl font-bold mb-4">Описание</h3>
            <div class="prose prose-invert max-w-none whitespace-pre-line">
              {{ currentRole.description }}
            </div>
          </div>
        </VisibilityToggle>

        <!-- Особенности -->
        <VisibilityToggle
          :content-id="`role-${currentRole.id}-features`"
          content-type="role-features"
        >
          <div v-if="currentRole.features && currentRole.features.length" class="mb-8">
            <h3 class="text-2xl font-bold mb-4">Особенности</h3>
            <div class="space-y-4">
              <VisibilityToggle
                v-for="(feature, index) in currentRole.features"
                :key="index"
                :content-id="`role-${currentRole.id}-feature-${index}`"
                content-type="role-feature"
              >
                <div class="bg-gray-700 p-4 rounded-lg">
                  <h4 class="text-xl font-semibold mb-2">{{ feature.name }}</h4>
                  <div class="prose prose-invert max-w-none whitespace-pre-line">
                    {{ feature.description }}
                  </div>
                </div>
              </VisibilityToggle>
            </div>
          </div>
        </VisibilityToggle>
      </div>
    </div>
  </div>
</template>

<style scoped>
.role-page {
  max-width: 1200px;
  margin: 0 auto;
}
.prose-invert {
  color: inherit;
}

.drag-handle {
  opacity: 0.5;
  transition: opacity 0.2s;
  padding: 0 8px;
}
.drag-handle:hover {
  opacity: 1;
  cursor: grab;
}
</style>