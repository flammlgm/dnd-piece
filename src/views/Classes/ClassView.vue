<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import Spinner from '@/components/UI/Spinner.vue';
import ClassHeader from './components/ClassHeader.vue';
import ClassTabs from './components/ClassTabs.vue';
import ClassMainTab from './components/ClassMainTab/ClassMainTab.vue';
import ClassAbilitiesTab from './components/ClassAbilitiesTab/ClassAbilitiesTab.vue';
import ClassSubclassesTab from './components/ClassSubclassesTab/ClassSubclassesTab.vue';
import ClassEditForm from './components/ClassEditForm/ClassEditForm.vue';

const route = useRoute();
const router = useRouter();
const classId = parseInt(route.params.id);

// Состояния данных
const currentClass = ref(null);
const subclasses = ref([]);
const loading = ref(true);
const spells = ref([]);

// Состояния интерфейса
const activeTab = ref('main');
const showSubclasses = ref(false);
const isEditing = ref(false);
const isEditingSubclass = ref(false);
const isSubclassModalOpen = ref(false);
const editingSubclass = ref(null);

// Загрузка данных
const fetchData = async () => {
  try {
    loading.value = true;
    const [classRes, subclassesRes] = await Promise.all([
      axios.get(`http://localhost:5000/api/classes/${classId}`),
      axios.get(`http://localhost:5000/api/subclasses/`)
    ]);
    
    currentClass.value = classRes.data;
    subclasses.value = subclassesRes.data.filter(s => s.class_id == classId).sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error('Ошибка загрузки:', err);
  } finally {
    loading.value = false;
  }
};

const fetchSpells = async () => {
  try {
    const { data } = await axios.get(`http://localhost:5000/api/spells/class/${classId}`);
    spells.value = data;
  } catch (err) {
    console.error('Ошибка загрузки заклинаний:', err);
  }
};

// Основные действия класса
const editClass = () => {
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
};

const saveClass = async (data) => {
  try {
    const { data: updatedClass } = await axios.put(
      `http://localhost:5000/api/classes/${classId}`,
      data
    );
    
    currentClass.value = updatedClass;
    isEditing.value = false;
  } catch (err) {
    console.error('Ошибка сохранения:', err);
  }
};

const deleteClass = async () => {
  if (confirm('Удалить класс?')) {
    await axios.delete(`http://localhost:5000/api/classes/${classId}`);
    router.push('/classes');
  }
};

// Методы для работы с заклинаниями
const createSpell = async (spellData) => {
  try {
    const { data } = await axios.post('http://localhost:5000/api/spells', spellData);
    spells.value.push(data);
  } catch (err) {
    console.error('Ошибка создания заклинания:', err);
  }
};

const updateSpell = async (spellData) => {
  try {
    const { data } = await axios.put(
      `http://localhost:5000/api/spells/${spellData.id}`,
      spellData
    );
    
    const index = spells.value.findIndex(s => s.id === data.id);
    if (index >= 0) {
      spells.value[index] = data;
    }
  } catch (err) {
    console.error('Ошибка обновления заклинания:', err);
  }
};

const deleteSpell = async (id) => {
  if (confirm('Удалить заклинание?')) {
    try {
      await axios.delete(`http://localhost:5000/api/spells/${id}`);
      spells.value = spells.value.filter(s => s.id !== id);
    } catch (err) {
      console.error('Ошибка удаления заклинания:', err);
    }
  }
};

// Методы для работы с подклассами
const saveSubclass = async (subclassData) => {
  try {
    const { data } = await axios.put(
      `http://localhost:5000/api/subclasses/${subclassData.id}`,
      subclassData
    );
    
    const index = subclasses.value.findIndex(s => s.id === data.id);
    if (index >= 0) {
      subclasses.value[index] = data;
    }
  } catch (err) {
    console.error('Ошибка сохранения подкласса:', err);
    alert('Не удалось сохранить подкласс');
  }
};

const deleteSubclass = async (id) => {
  if (confirm('Удалить подкласс?')) {
    try {
      await axios.delete(`http://localhost:5000/api/subclasses/${id}`);
      subclasses.value = subclasses.value.filter(s => s.id !== id);
      activeTab.value = 'main';
    } catch (err) {
      console.error('Ошибка удаления подкласса:', err);
    }
  }
};

onMounted(() => {
  fetchData();
  fetchSpells();
});
</script>

<template>
  <div v-if="loading" class="flex justify-center items-center h-screen">
    <Spinner size="huge"/>
  </div>

  <div v-else-if="currentClass" class="class-page bg-gray-900 text-white font-mono min-h-screen p-6">
    <!-- Режим редактирования -->
    <ClassEditForm 
      v-if="isEditing" 
      :classData="currentClass"
      @save="saveClass"
      @cancel="cancelEdit"
    />
    
    <!-- Режим просмотра -->
    <div v-else class="flex flex-col lg:flex-row gap-6 items-start">
      <!-- Боковая панель с изображением -->
      <div class="w-full lg:w-1/3 flex-shrink-0 lg:sticky lg:top-6 lg:self-start h-fit">
        <img 
          v-if="currentClass.image_path" 
          :src="currentClass.image_path" 
          alt="Изображение класса" 
          class="rounded-2xl w-full h-auto object-cover"
        />
      </div>
      
      <!-- Основной контент -->
      <div class="flex-1 bg-gray-800 rounded-2xl p-6 lg:p-10 w-full">
        <ClassHeader 
          :classData="currentClass"
          @edit="editClass"
        />
        
        <ClassTabs 
          v-model:activeTab="activeTab"
          v-model:showSubclasses="showSubclasses"
          :subclasses="subclasses"
        />
        
        <ClassMainTab 
          v-if="activeTab === 'main'"
          :classData="currentClass"
        />
        
        <ClassAbilitiesTab 
          v-else-if="activeTab === 'abilities'"
          :spells="spells"
          :classId="classId"
          @createSpell="createSpell"
          @updateSpell="updateSpell"
          @deleteSpell="deleteSpell"
        />
        
        <ClassSubclassesTab 
          v-else-if="activeTab.startsWith('subclass-')"
          :subclasses="subclasses"
          :activeTab="activeTab"
          @saveSubclass="saveSubclass"
          @deleteSubclass="deleteSubclass"
        />
      </div>
    </div>
  </div>
</template>