<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import Spinner from '@/components/UI/Spinner.vue';
import IconButton from '@/components/UI/Button/IconButton.vue';
import InputField from '@/components/UI/Inputs/InputField.vue';
import { Pen, Trash, Save, X, ALargeSmall, Rabbit, Fish, Hourglass, Ruler, Weight, CirclePlus, GraduationCap, Plus } from 'lucide-vue-next';
import draggable from 'vuedraggable';
import VisibilityToggle from '@/components/VisibilityToggle.vue'
import {useAuthStore} from '@/stores/auth.js'

const authStore = useAuthStore()
const route = useRoute();
const router = useRouter();
const raceId = parseInt(route.params.id);

const currentRace = ref(null);
const loading = ref(true);
const isEditing = ref(false);

const editData = ref({
  name: '',
  description: '',
  base_stats: {
    bio: {
      age: '',
      height: '',
      weight: ''
    },
    stats: ''
  },
  proficiencies: {},
  features: [], // Изменено на массив для сохранения порядка
  underwater_breathing: false,
  water_resistance: false,
  speed: 30,
  water_speed: 0,
  image_path: '',
  image_position: ''
});

// Загрузка данных
const fetchData = async () => {
  try {
    loading.value = true;
    const { data } = await axios.get(`http://localhost:5000/api/races/${raceId}`);
    currentRace.value = data;
    initEditData(data);
  } catch (err) {
    console.error('Ошибка загрузки:', err);
  } finally {
    loading.value = false;
  }
};

const initEditData = (data) => {
  // Преобразуем features в массив (если это объект - больше не нужно)
  editData.value = {
    ...data,
    features: Array.isArray(data.features) 
      ? data.features 
      : [], // На всякий случай обрабатываем null/undefined
    base_stats: data.base_stats || {
      bio: { age: '', height: '', weight: '' },
      stats: ''
    }
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

// Управление владениями
const addProficiency = () => {
  const newKey = `Новое владение ${Object.keys(editData.value.proficiencies).length + 1}`;
  editData.value.proficiencies[newKey] = '';
};

const removeProficiency = (key) => {
  delete editData.value.proficiencies[key];
};

// Основные действия
const editRace = () => {
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  initEditData(currentRace.value);
};

const saveRace = async () => {
  try {
    // Подготовка данных с глубоким копированием
    const dataToSend = JSON.parse(JSON.stringify({
      ...editData.value,
      features: editData.value.features.map((f, idx) => ({
        id: f.id || `temp-${idx}-${Date.now()}`,
        name: f.name || `Особенность ${idx + 1}`,
        description: f.description || '',
        order: idx
      }))
    }));

    console.log('Отправляемые данные:', dataToSend);

    const { data } = await axios.put(
      `http://localhost:5000/api/races/${raceId}`,
      dataToSend,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        transformRequest: [(data) => JSON.stringify(data)]
      }
    );
    
    currentRace.value = data;
    isEditing.value = false;
  } catch (err) {
    console.error('Ошибка сохранения:', {
      request: err.config?.data,
      response: err.response?.data
    });
    alert(`Ошибка: ${err.response?.data?.error || err.message}`);
  }
};

const deleteRace = async () => {
  if (confirm('Удалить расу?')) {
    await axios.delete(`http://localhost:5000/api/races/${raceId}`);
    router.push('/races');
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

  <div v-else-if="currentRace" class="race-page bg-gray-900 text-white min-h-screen p-6">
    <!-- Режим редактирования -->
    <div v-if="isEditing" class="bg-gray-800 rounded-2xl p-6 mb-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-4xl font-bold">Редактирование расы</h1>
        <div class="flex gap-2">
          <IconButton @click="saveRace" title="Сохранить">
            <Save class="w-5 h-5"/>
          </IconButton>
          <IconButton @click="cancelEdit" title="Отменить">
            <X class="w-5 h-5"/>
          </IconButton>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block mb-2">Название расы</label>
          <InputField v-model="editData.name" :icon="ALargeSmall"/>
        </div>
        <div>
          <label class="block mb-2">Скорость (футы)</label>
          <InputField v-model.number="editData.speed" type="number" :icon="Rabbit"/>
        </div>
        <div>
          <label class="block mb-2">Скорость в воде (футы)</label>
          <InputField v-model.number="editData.water_speed" type="number" :icon="Fish"/>
        </div>
        <div class="flex items-center">
          <input type="checkbox" id="underwater_breathing" v-model="editData.underwater_breathing" class="mr-2">
          <label for="underwater_breathing">Дыхание под водой</label>
          <div class="flex items-center ml-4">
            <input type="checkbox" id="water_resistance" v-model="editData.water_resistance" class="mr-2">
            <label for="water_resistance">Бой в воде</label>
          </div>
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
        <h3 class="text-xl font-bold mb-2">Физические характеристики</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block mb-1">Возраст</label>
            <InputField v-model="editData.base_stats.bio.age" :icon="Hourglass"/>
          </div>
          <div>
            <label class="block mb-1">Рост</label>
            <InputField v-model="editData.base_stats.bio.height" :icon="Ruler"/>
          </div>
          <div>
            <label class="block mb-1">Вес</label>
            <InputField v-model="editData.base_stats.bio.weight" :icon="Weight"/>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-xl font-bold mb-2">Бонусы характеристик</h3>
        <InputField v-model="editData.base_stats.stats" placeholder="Например: +1 к каждой" :icon="CirclePlus"/>
      </div>

      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-xl font-bold">Владения</h3>
          <IconButton @click="addProficiency" title="Добавить">
            <Plus class="w-5 h-5"/>
          </IconButton>
        </div>
        <div v-for="(value, key) in editData.proficiencies" :key="key" class="mb-4 flex items-center">
          <InputField v-model="editData.proficiencies[key]" :placeholder="key" class="flex-1"  :icon="GraduationCap"/>
          <IconButton @click="removeProficiency(key)" title="Удалить" class="ml-2">
            <Trash class="w-4 h-4"/>
          </IconButton>
        </div>
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
      <div class="w-full lg:w-1/3 flex-shrink-0">
        <img 
          v-if="currentRace.image_path" 
          :src="currentRace.image_path" 
          alt="Изображение расы" 
          class="rounded-2xl w-full h-auto object-cover"
        />
      </div>
      
      <!-- Основной контент -->
      <div class="flex-1 bg-gray-800 rounded-2xl p-6 lg:p-10 w-full">
        <!-- Заголовок и кнопки -->
        <div class="flex justify-between items-start mb-6">
          <h1 class="text-4xl font-bold">{{ currentRace.name }}</h1>
          <div class="flex gap-2" v-if="authStore.user?.role === 'master'">
            <IconButton @click="editRace" title="Изменить расу">
              <Pen class="w-4 h-4"/>
            </IconButton>
            <!-- <IconButton @click="deleteRace" title="Удалить расу">
              <Trash class="w-4 h-4"/>
            </IconButton> -->
          </div>
        </div>

        <!-- Основные характеристики -->
        <div class=" mb-10">
            <div class="overflow-x-auto border border-gray-600 rounded-lg w-full">
                <table class="w-full">
                    <thead>
                    <tr class="bg-gray-700">
                        <th class="p-2 border border-gray-600 text-center">Рост</th>
                        <th class="p-2 border border-gray-600 text-center">Вес</th>
                        <th class="p-2 border border-gray-600 text-center">Скорость</th>
                        <th class="p-2 border border-gray-600 text-center">Скорость в воде</th>
                        <th class="p-2 border border-gray-600 text-center">Бонусы характеристик</th>
                        <th class="p-2 border border-gray-600 text-center">Возраст</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr class="hover:bg-gray-700/50">
                        <td class="p-2 border border-gray-600 text-center">{{ currentRace.base_stats?.bio?.height || 'Не указано' }}</td>
                        <td class="p-2 border border-gray-600 text-center">{{ currentRace.base_stats?.bio?.weight || 'Не указано' }}</td>
                        <td class="p-2 border border-gray-600 text-center">{{ currentRace.speed }} футов</td>
                        <td class="p-2 border border-gray-600 text-center">{{ currentRace.water_speed }} футов</td>
                        <td class="p-2 border border-gray-600 text-center">{{ currentRace.base_stats?.stats || 'Не указано' }}</td>
                        <td class="p-2 border border-gray-600 text-center">{{ currentRace.base_stats?.bio?.age || 'Не указано' }}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <br>
          <div>
            <p class="mb-2"><b>Дыхание под водой:</b> {{ currentRace.underwater_breathing ? 'Да' : 'Нет' }}</p>
            <p class="mb-2"><b>Бой в воде:</b> {{ currentRace.water_resistance ? 'Да' : 'Нет' }}</p>
            <p><b>Владение:</b> {{ currentRace.proficiencies.weapon}}</p>
          </div>
        </div>

        <!-- Описание -->
        <div class="mb-8">
          <VisibilityToggle
            :content-id="`race-${currentRace.id}-description`"
            content-type="race-description"
          >
            <h3 class="text-2xl font-bold mb-4">Описание</h3>
            <div class="prose prose-invert max-w-none whitespace-pre-line">
              {{ currentRace.description }}
            </div>
          </VisibilityToggle>
        </div>

        <!-- Особенности -->
        <VisibilityToggle
  :content-id="`race-${currentRace.id}-features`"
  content-type="race-features"
>
  <div v-if="currentRace.features && currentRace.features.length" class="mb-8">
    <h3 class="text-2xl font-bold mb-4">Особенности</h3>
    <div class="space-y-4">
      <div 
        v-for="(feature, index) in currentRace.features" 
        :key="index" 
        class="bg-gray-700 p-4 rounded-lg"
      >
        <VisibilityToggle
          :content-id="`race-${currentRace.id}-feature-${index}`"
          content-type="race-feature"
        >
          <h4 class="text-xl font-semibold mb-2">{{ feature.name }}</h4>
          <div class="prose prose-invert max-w-none whitespace-pre-line">
            {{ feature.description }}
          </div>
        </VisibilityToggle>
      </div>
    </div>
  </div>
</VisibilityToggle>
      </div>
    </div>
  </div>
</template>

<style scoped>
.race-page {
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