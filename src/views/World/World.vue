<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Spinner from '@/components/UI/Spinner.vue';
import IconButton from '@/components/UI/Button/IconButton.vue';
import { Plus, Search, Edit, Trash, X, Save } from 'lucide-vue-next';
import VisibilityToggle from '@/components/VisibilityToggle.vue'
import {useAuthStore} from '@/stores/auth.js'

const authStore = useAuthStore()

const entryTypes = [
  { value: 'character', label: 'Персонаж' },
  { value: 'location', label: 'Локация' },
  { value: 'event', label: 'Событие' },
  { value: 'organization', label: 'Организация' },
  { value: 'item', label: 'Предмет' },
  { value: 'other', label: 'Другое' }
];

const entries = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedEntry = ref(null);
const isEditing = ref(false);
const isCreating = ref(false);
const editForm = ref({
  id: null,
  name: '',
  type: 'character',
  description: '',
  imageFile: null,
  imagePreview: null,
  hasImage: false
});

const fetchEntries = async () => {
  try {
    loading.value = true;
    const { data } = await axios.get('http://localhost:5000/api/world');
    entries.value = data;
  } catch (err) {
    console.error('Ошибка загрузки:', err);
  } finally {
    loading.value = false;
  }
};

const searchEntries = async () => {
  if (!searchQuery.value.trim()) {
    fetchEntries();
    return;
  }

  try {
    loading.value = true;
    const { data } = await axios.get('http://localhost:5000/api/world/search', {
      params: { query: searchQuery.value }
    });
    entries.value = data;
  } catch (err) {
    console.error('Ошибка поиска:', err);
  } finally {
    loading.value = false;
  }
};

const viewEntry = (entry) => {
  selectedEntry.value = entry;
  isEditing.value = false;
  isCreating.value = false;
};

const startCreateEntry = () => {
  editForm.value = {
    id: null,
    name: '',
    type: 'character',
    description: '',
    imageFile: null,
    imagePreview: null,
    hasImage: false
  };
  isCreating.value = true;
  isEditing.value = false;
  selectedEntry.value = null;
};

const startEditEntry = (entry) => {
  editForm.value = {
    id: entry.id,
    name: entry.name,
    type: entry.type,
    description: entry.description || '',
    imageFile: null,
    imagePreview: entry.image_data 
      ? `data:${entry.image_mime_type};base64,${entry.image_data}`
      : null,
    hasImage: entry.has_image
  };
  isEditing.value = true;
  isCreating.value = false;
};

const cancelEdit = () => {
  isEditing.value = false;
  isCreating.value = false;
  if (selectedEntry.value) {
    viewEntry(selectedEntry.value);
  }
};

const handleImageError = (event) => {
  console.error('Ошибка загрузки изображения');
  event.target.style.display = 'none';
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Пожалуйста, выберите изображение');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('Изображение слишком большое (макс. 5MB)');
    return;
  }

  editForm.value.imageFile = file;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    editForm.value.imagePreview = e.target.result;
    editForm.value.hasImage = true;
  };
  reader.readAsDataURL(file);
};

const saveEntry = async () => {
  try {
    loading.value = true;
    const formData = new FormData();
    formData.append('name', editForm.value.name);
    formData.append('type', editForm.value.type);
    formData.append('description', editForm.value.description);
    
    if (editForm.value.imageFile) {
      formData.append('image', editForm.value.imageFile);
    } else if (isEditing.value && !editForm.value.hasImage) {
      formData.append('removeImage', 'true');
    }

    let response;
    if (isCreating.value) {
      response = await axios.post('http://localhost:5000/api/world', formData);
      entries.value = [...entries.value, response.data]; // Обновляем массив
    } else {
      response = await axios.put(`http://localhost:5000/api/world/${editForm.value.id}`, formData);
      entries.value = entries.value.map(e => 
        e.id === response.data.id ? response.data : e
      ); // Обновляем конкретную запись
    }

    isEditing.value = false;
    isCreating.value = false;
    selectedEntry.value = response.data; // Обновляем выбранную запись
  } catch (err) {
    console.error('Ошибка сохранения:', err);
    alert('Не удалось сохранить запись');
  } finally {
    loading.value = false;
  }
};
const deleteEntry = async (id) => {
  if (!confirm('Удалить запись?')) return;

  try {
    await axios.delete(`http://localhost:5000/api/world/${id}`);
    entries.value = entries.value.filter(e => e.id !== id);
    
    if (selectedEntry.value?.id === id) {
      selectedEntry.value = null;
    }
  } catch (err) {
    console.error('Ошибка удаления:', err);
    alert('Не удалось удалить запись');
  }
};

const getEntryTypeLabel = (typeValue) => {
  const type = entryTypes.find(t => t.value === typeValue);
  return type ? type.label : 'Неизвестно';
};

const getEntryImageUrl = (entry) => {
  if (!entry || !entry.has_image || !entry.image_data || !entry.image_mime_type) {
    console.log('Missing image data for entry:', entry?.id);
    return null;
  }
  return `data:${entry.image_mime_type};base64,${entry.image_data}`;
};


onMounted(async () => {
    await fetchEntries();
    console.log('Entries loaded:', entries.value);
    if (entries.value.length > 0) {
        console.log('First entry image info:', {
            has_image: entries.value[0].has_image,
            mime_type: entries.value[0].image_mime_type,
            data_length: entries.value[0].image_data?.length
        });
    }
});
</script>

<template>
   <div v-if="loading" class="flex justify-center items-center h-screen">
     <Spinner size="huge"/>
   </div>
 
   <div v-else class="world-page bg-gray-900 text-white font-mono min-h-screen">
     <div class="flex flex-col lg:flex-row h-full">
       <!-- Левая панель - список записей -->
       <div class="w-full lg:w-1/3 bg-gray-800 p-4 mt-6 ml-6 rounded-xl">
         <div class="flex items-center mb-4">
           <h1 class="text-2xl font-bold flex-1">Мир</h1>
           <IconButton @click="startCreateEntry" title="Добавить запись" v-if="authStore.user?.role === 'master'">
             <Plus class="w-5 h-5"/>
           </IconButton>
         </div>
 
         <!-- <div class="relative mb-4">
           <input
             v-model="searchQuery"
             @input="searchEntries"
             type="text"
             placeholder="Поиск..."
             class="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
           />
           <Search class="absolute left-3 top-2.5 text-gray-400 w-5 h-5"/>
         </div> -->
 
         <div class="space-y-2 overflow-y-auto">
          <VisibilityToggle
            v-for="item in entries"
            :key="item.id"
            :content-id="`world-entry-${item.id}`"
            content-type="world-entry"
          >
            <div
              @click="viewEntry(item)"
              :class="{
                'bg-gray-700': selectedEntry?.id === item.id,
                'hover:bg-gray-700/50': selectedEntry?.id !== item.id
              }"
              class="p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-3"
            >
              <div v-if="item.has_image" class="flex-shrink-0">
                <img 
                  :src="getEntryImageUrl(item)"
                  class="w-10 h-10 object-cover rounded"
                  alt="Превью"
                  @error="handleImageError"
                  v-if="getEntryImageUrl(item)"
                />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold truncate">{{ item.name }}</h3>
                <p class="text-sm text-gray-400 truncate">
                  {{ getEntryTypeLabel(item.type) }}
                </p>
              </div>
            </div>
          </VisibilityToggle>
        </div>
       </div>
 
       <!-- Правая панель - просмотр/редактирование -->
       <div class="flex-1 p-6 overflow-y-auto max-h-screen">
         <!-- Режим создания/редактирования -->
         <div v-if="isEditing || isCreating" class="bg-gray-800 rounded-xl p-6">
           <div class="flex justify-between items-center mb-4">
             <h2 class="text-xl font-bold">
               {{ isCreating ? 'Новая запись' : 'Редактирование записи' }}
             </h2>
             <div class="flex gap-2">
               <IconButton @click="cancelEdit" title="Отменить">
                 <X class="w-5 h-5"/>
               </IconButton>
               <IconButton @click="saveEntry" title="Сохранить">
                 <Save class="w-5 h-5"/>
               </IconButton>
             </div>
           </div>
 
           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div class="space-y-4">
               <div>
                 <label class="block mb-1">Название</label>
                 <input
                   v-model="editForm.name"
                   type="text"
                   class="w-full p-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                 />
               </div>
 
               <div>
                 <label class="block mb-1">Тип</label>
                 <select
                   v-model="editForm.type"
                   class="w-full p-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                 >
                   <option v-for="type in entryTypes" :key="type.value" :value="type.value">
                     {{ type.label }}
                   </option>
                 </select>
               </div>
 
               <div>
                 <label class="block mb-1">Изображение</label>
                 <input
                   type="file"
                   accept="image/*"
                   @change="handleImageUpload"
                   class="w-full p-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                 />
               </div>
 
               <div v-if="editForm.imagePreview" class="mt-2">
                 <img 
                   :src="editForm.imagePreview"
                   class="max-w-full h-auto max-h-48 object-contain rounded-lg"
                   alt="Предпросмотр"
                 />
               </div>
             </div>
 
             <div>
               <label class="block mb-1">Описание</label>
               <textarea
                 v-model="editForm.description"
                 rows="10"
                 class="w-full p-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
               ></textarea>
             </div>
           </div>
         </div>
 
         <!-- Режим просмотра -->
         <div v-else-if="selectedEntry" class="bg-gray-800 rounded-xl p-6">
           <div class="flex justify-between items-start mb-4">
             <div>
               <h2 class="text-2xl font-bold">{{ selectedEntry.name }}</h2>
               <p class="text-sm text-gray-400">
                 {{ getEntryTypeLabel(selectedEntry.type) }}
               </p>
             </div>
             <div class="flex gap-2">
               <IconButton @click="startEditEntry(selectedEntry)" title="Редактировать">
                 <Edit class="w-5 h-5"/>
               </IconButton>
               <IconButton @click="deleteEntry(selectedEntry.id)" title="Удалить">
                 <Trash class="w-5 h-5"/>
               </IconButton>
             </div>
           </div>
 
           <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div v-if="selectedEntry?.has_image && getEntryImageUrl(selectedEntry)" class="lg:order-2 w-full pl-20">
               <img 
                 :src="getEntryImageUrl(selectedEntry)"
                 class="w-full h-auto rounded-xl"
                 :alt="selectedEntry.name"
                 @error="handleImageError"
               />
             </div>
 
             <div class="lg:order-1">
               <div class="prose prose-invert max-w-none whitespace-pre-line">
                 {{ selectedEntry.description || 'Описание отсутствует' }}
               </div>
             </div>
           </div>
         </div>
 
         <!-- Пустое состояние -->
         <div v-else class="flex flex-col items-center justify-center h-full text-gray-500">
           <p class="text-lg">Выберите запись для просмотра</p>
         </div>
       </div>
     </div>
   </div>
 </template>
 
 <style scoped>
 .world-page {
   max-height: 100vh;
   overflow: hidden;
 }
 
 .prose {
   max-width: none;
 }
 
 .prose-invert {
   color: inherit;
 }
 </style>