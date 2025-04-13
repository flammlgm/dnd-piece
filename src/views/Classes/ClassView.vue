<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import Spinner from '@/components/UI/Spinner.vue';
import IconButton from '@/components/UI/Button/IconButton.vue';
import InputField from '@/components/UI/Inputs/InputField.vue';
import Modal from '@/components/UI/Modal.vue';
import { 
  Pen, Trash, Save, X, Plus, Minus, CaseSensitive, 
  Dices, BicepsFlexed, Sword, Shield, Hammer, Skull, 
  Beaker, Backpack, ChevronDown, ChevronUp, Sparkles 
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const classId = parseInt(route.params.id);

// Состояния данных
const currentClass = ref(null);
const subclasses = ref([]);
const loading = ref(true);

// Состояния интерфейса
const activeTab = ref('main');
const showSubclasses = ref(false);
const isEditing = ref(false);
const isEditingSubclass = ref(false);
const isSubclassModalOpen = ref(false);
const editingSubclass = ref(null);
const editSubclassData = ref(null);

// Данные для редактирования
const editData = ref({
  name: '',
  description: '',
  hit_dice: '',
  base_stats: '',
  features: { columns: [], levels: [] },
  proficiencies: {
    armor: '',
    weapons: [],
    tools: '',
    savingThrows: [],
    skills: '',
    equipment: []
  }
});

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
    initEditData(classRes.data);
  } catch (err) {
    console.error('Ошибка загрузки:', err);
  } finally {
    loading.value = false;
  }
};

const initEditData = (data) => {
  editData.value = JSON.parse(JSON.stringify(data));
  
  if (!editData.value.proficiencies) {
    editData.value.proficiencies = {
      armor: '',
      weapons: [],
      tools: '',
      savingThrows: [],
      skills: '',
      equipment: []
    };
  }
  
  editData.value.proficiencies.weaponsStr = editData.value.proficiencies.weapons?.join(', ') || '';
  editData.value.proficiencies.savingThrowsStr = editData.value.proficiencies.savingThrows?.join(', ') || '';
};

// Основные действия класса
const editClass = () => {
  isEditing.value = true;
  initEditData(currentClass.value);
};

const cancelEdit = () => {
  isEditing.value = false;
  initEditData(currentClass.value);
};

const saveClass = async () => {
  try {
    editData.value.proficiencies.weapons = editData.value.proficiencies.weaponsStr
      .split(',')
      .map(w => w.trim())
      .filter(w => w);
    
    editData.value.proficiencies.savingThrows = editData.value.proficiencies.savingThrowsStr
      .split(',')
      .map(st => st.trim())
      .filter(st => st);

    const { data } = await axios.put(
      `http://localhost:5000/api/classes/${classId}`,
      editData.value
    );
    
    currentClass.value = data;
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

// Методы для работы с таблицей
const addColumn = () => {
  editData.value.features.columns.push({
    key: `newColumn${editData.value.features.columns.length + 1}`,
    title: 'Новая колонка'
  });
};

const removeColumn = (index) => {
  editData.value.features.columns.splice(index, 1);
};

const addLevel = () => {
  const newLevel = { level: editData.value.features.levels.length + 1 };
  editData.value.features.columns.forEach(col => {
    if (col.key === 'skills') {
      newLevel[col.key] = [];
    } else {
      newLevel[col.key] = '';
    }
  });
  editData.value.features.levels.push(newLevel);
};

const removeLevel = (index) => {
  editData.value.features.levels.splice(index, 1);
};

const addSkill = (levelIndex) => {
  if (!editData.value.features.levels[levelIndex].skills) {
    editData.value.features.levels[levelIndex].skills = [];
  }
  editData.value.features.levels[levelIndex].skills.push({
    name: '',
    description: ''
  });
};

const removeSkill = (levelIndex, skillIndex) => {
  editData.value.features.levels[levelIndex].skills.splice(skillIndex, 1);
};

const addEquipment = () => {
  editData.value.proficiencies.equipment.push('');
};

const removeEquipment = (index) => {
  editData.value.proficiencies.equipment.splice(index, 1);
};

const updateWeaponsList = () => {
  editData.value.proficiencies.weapons = editData.value.proficiencies.weaponsStr
    .split(',')
    .map(w => w.trim())
    .filter(w => w);
};

// Подклассы
const createNewSubclass = () => {
  editingSubclass.value = {
    class_id: classId,
    name: 'Новый подкласс',
    description: '',
    features: {
      columns: [
        { key: 'level', title: 'Уровень' },
        { key: 'bm', title: 'БМ' },
        { key: 'skills', title: 'Навыки' }
      ],
      levels: []
    }
  };
  isSubclassModalOpen.value = true;
};

const editSubclass = (subclass) => {
  editingSubclass.value = JSON.parse(JSON.stringify(subclass));
  editSubclassData.value = JSON.parse(JSON.stringify(subclass));
  isEditingSubclass.value = true;
  activeTab.value = `subclass-${subclass.id}`;
};

const cancelEditSubclass = () => {
  isEditingSubclass.value = false;
  editSubclassData.value = null;
};

const saveSubclass = async () => {
  try {
    const { data } = await axios.put(
      `http://localhost:5000/api/subclasses/${editSubclassData.value.id}`,
      editSubclassData.value
    );
    
    const index = subclasses.value.findIndex(s => s.id === data.id);
    if (index >= 0) {
      subclasses.value[index] = data;
    }
    
    isEditingSubclass.value = false;
    editingSubclass.value = data;
  } catch (err) {
    console.error('Ошибка сохранения подкласса:', err);
    alert('Не удалось сохранить подкласс');
  }
};

const deleteSubclass = async (id) => {
  if (confirm('Удалить подкласс?')) {
    await axios.delete(`http://localhost:5000/api/subclasses/${id}`);
    subclasses.value = subclasses.value.filter(s => s.id !== id);
  }
};

// Методы для работы с таблицей подкласса
const addSubclassColumn = () => {
  if (!editSubclassData.value.features) {
    editSubclassData.value.features = { columns: [], levels: [] };
  }
  editSubclassData.value.features.columns.push({
    key: `newColumn${editSubclassData.value.features.columns.length + 1}`,
    title: 'Новая колонка'
  });
};

const removeSubclassColumn = (index) => {
  editSubclassData.value.features.columns.splice(index, 1);
};

const addSubclassLevel = () => {
  if (!editSubclassData.value.features) {
    editSubclassData.value.features = { columns: [], levels: [] };
  }
  
  const newLevel = { level: editSubclassData.value.features.levels.length + 1 };
  editSubclassData.value.features.columns.forEach(col => {
    if (col.key === 'skills') {
      newLevel[col.key] = [];
    } else {
      newLevel[col.key] = '';
    }
  });
  editSubclassData.value.features.levels.push(newLevel);
};

const removeSubclassLevel = (index) => {
  editSubclassData.value.features.levels.splice(index, 1);
};

const addSubclassSkill = (levelIndex) => {
  if (!editSubclassData.value.features.levels[levelIndex].skills) {
    editSubclassData.value.features.levels[levelIndex].skills = [];
  }
  editSubclassData.value.features.levels[levelIndex].skills.push({
    name: '',
    description: ''
  });
};

const removeSubclassSkill = (levelIndex, skillIndex) => {
  editSubclassData.value.features.levels[levelIndex].skills.splice(skillIndex, 1);
};

onMounted(fetchData);
</script>

<template>
  <div v-if="loading" class="flex justify-center items-center h-screen">
    <Spinner size="huge"/>
  </div>

  <div v-else-if="currentClass" class="class-page bg-gray-900 text-white min-h-screen p-6">
    <!-- Режим редактирования основного класса -->
    <div v-if="isEditing" class="bg-gray-800 rounded-2xl p-6 mb-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-4xl font-bold">Редактирование класса</h1>
        <div class="flex gap-2">
          <IconButton @click="saveClass" title="Сохранить">
            <Save class="w-5 h-5"/>
          </IconButton>
          <IconButton @click="cancelEdit" title="Отменить">
            <X class="w-5 h-5"/>
          </IconButton>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label class="block mb-2">Название класса</label>
          <InputField v-model="editData.name" :icon="CaseSensitive"/> 
        </div>
        <div>
          <label class="block mb-2">Кость хитов</label>
          <InputField v-model="editData.hit_dice" :icon="Dices"/> 
        </div>
        <div>
          <label class="block mb-2">Базовая характеристика</label>
          <InputField v-model="editData.base_stats" :icon="BicepsFlexed"/> 
        </div>
      </div>

      <!-- Редактор таблицы уровней -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-2xl font-bold">Таблица прогрессии уровней</h3>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse border border-gray-600">
            <thead>
              <tr class="bg-gray-700 ">
                <th class="p-2 border border-gray-600">
                  <IconButton @click="addColumn" title="Добавить колонку">
                    <Plus class="w-4 h-4"/>
                  </IconButton>
                </th>
                <th 
                  v-for="(column, colIndex) in editData.features.columns" 
                  :key="column.key"
                  class="p-2 border border-gray-600"
                >
                  <div class="flex items-center gap-2">
                    <input v-model="column.title" class="flex-1 block w-auto  pl-3 pr-4 py-3 rounded-xl transition-all duration-300 outline-none
                  bg-gray-800 focus:bg-gray-900
                  focus:outline-none focus:ring-4 ffocus:border-transparent px-1"
                 /> 
                    
                    <IconButton @click.stop="removeColumn(colIndex)" title="Удалить колонку">
                      <Minus class="w-3 h-3"/>
                    </IconButton>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(level, levelIndex) in editData.features.levels" 
                :key="levelIndex"
                class="hover:bg-gray-700/50"
              >
                <td class="p-2 border border-gray-600">
                  <div class="flex gap-1">
                    <IconButton @click="removeLevel(levelIndex)" title="Удалить уровень">
                      <Trash class="w-4 h-4 sm:w-5 sm:h-5"/>
                    </IconButton>
                    
                    
                  </div>
                </td>
                <td 
                  v-for="column in editData.features.columns" 
                  :key="column.key"
                  class="p-2 border border-gray-600"
                >
                  <input 
                    v-model="level[column.key]" 
                    class="w-full block pl-3 py-3 rounded-xl transition-all duration-300 outline-none
                  bg-gray-800 focus:bg-gray-900
                  focus:outline-none focus:ring-4 ffocus:border-transparent px-1"
                    v-if="column.key !== 'skills'"
                    
                  >
                  <div v-else class="space-y-1">
                    <div 
                      v-for="(skill, skillIndex) in level.skills" 
                      :key="skillIndex"
                      class="flex items-center gap-1"
                    >
                      <input v-model="skill.name" class="flex-1 block w-auto  pl-3 pr-4 py-3 rounded-xl transition-all duration-300 outline-none
                  bg-gray-800 focus:bg-gray-900
                  focus:outline-none focus:ring-4 ffocus:border-transparent px-1"
                  >
                      <IconButton @click.stop="removeSkill(levelIndex, skillIndex)" title="Удалить навык">
                        <Minus class="w-3 h-3"/>
                      </IconButton>
                    </div>
                    <IconButton @click="addSkill(levelIndex)" title="Добавить навык">
                      <Plus class="w-3 h-3"/>
                    </IconButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <IconButton @click="addLevel" title="Добавить уровень" class="m-5">
              <Plus class="w-4 h-4 mr-3"/> Добавить уровень
            </IconButton>
        </div>
      </div>
      <div class="mb-8 bg-gray-700/50 p-4 rounded-lg">
        <h3 class="text-xl font-bold mb-4">Владения и снаряжение</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <!-- Оружие -->
          <div class="md:col-span-2">
            <label class="block mb-2">Оружие (через запятую):</label>
            <InputField 
              v-model="editData.proficiencies.weaponsStr" 
              @change="updateWeaponsList"
              placeholder="Простое оружие, Длинный меч, Рапира"
              :icon="Sword"/>
          </div>
          
          <!-- Броня и инструменты -->
          <div>
            <label class="block mb-2">Броня:</label>
            <InputField 
              v-model="editData.proficiencies.armor"
              @change="updateWeaponsList"
              placeholder="Простое оружие, Длинный меч, Рапира"
              :icon="Shield"/>
          </div>
          
          <div>
            <label class="block mb-2">Инструменты:</label>
            <InputField 
              v-model="editData.proficiencies.tools"
              @change="updateWeaponsList"
              placeholder="Простое оружие, Длинный меч, Рапира"
              :icon="Hammer"/>
          </div>
          
          <!-- Спасброски и навыки -->
          <div>
            <label class="block mb-2">Спасброски (через запятую):</label>
            <InputField 
              v-model="editData.proficiencies.savingThrowsStr"
              @change="updateWeaponsList"
              placeholder="Простое оружие, Длинный меч, Рапира"
              :icon="Skull"/>
          </div>
          
          <div>
            <label class="block mb-2">Навыки:</label>
            <InputField 
              v-model="editData.proficiencies.skills"
              @change="updateWeaponsList"
              placeholder="Простое оружие, Длинный меч, Рапира"
              :icon="Beaker"/>
          </div>
        </div>
        
        <!-- Снаряжение -->
        <h4 class="font-bold mb-2">Снаряжение:</h4>
        <div v-for="(item, index) in editData.proficiencies.equipment" :key="index" class="flex mb-2">
          <InputField 
              v-model="editData.proficiencies.equipment[index]"
              @change="updateWeaponsList"
              placeholder="Простое оружие, Длинный меч, Рапира"
              :icon="Backpack"
              class="w-full"/>
          <IconButton @click="removeEquipment(index)" title="Удалить" class="ml-3">
            <Minus class="w-4 h-4"/>
          </IconButton>
        </div>
        <IconButton @click="addEquipment" title="Добавить пункт снаряжения">
          <Plus class="w-4 h-4 mr-3"/> Добавить снаряжение
        </IconButton>
      </div>
      <!-- Редактор описаний навыков -->
      <div v-for="(level, levelIndex) in editData.features.levels" :key="`edit-${levelIndex}`">
        <h3 class="text-xl font-bold mb-2">Уровень {{ level.level }} - Описания навыков</h3>
        <div 
          v-for="(skill, skillIndex) in level.skills" 
          :key="skillIndex"
          class="mb-4 bg-gray-700/50 p-3 rounded"
        >
          <h4 class="font-bold mb-1">{{ skill.name }}</h4>
          <textarea 
            v-model="skill.description" 
            class="flex-1 block w-full h-32 pl-3 pr-4 py-3 rounded-xl transition-all duration-300 outline-none
                  bg-gray-800 focus:bg-gray-900
                  focus:outline-none focus:ring-4 ffocus:border-transparent px-1"
            placeholder="Описание навыка..."
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Режим просмотра -->
    <div v-else class="flex flex-col lg:flex-row gap-6 items-start">
      <!-- Боковая панель с изображением -->
      <div class="w-full lg:w-1/3 flex-shrink-0">
        <img 
          v-if="currentClass.image_path" 
          :src="currentClass.image_path" 
          alt="Изображение класса" 
          class="rounded-2xl w-full h-auto object-cover"
        />
      </div>
      
      <!-- Основной контент -->
      <div class="flex-1 bg-gray-800 rounded-2xl p-6 lg:p-10 w-full">
        <!-- Заголовок и кнопки -->
        <div class="flex justify-between items-start mb-6">
          <h1 class="text-4xl lg:text-5xl font-bold">{{ currentClass.name }}</h1>
          <div class="flex gap-2">
            <IconButton @click="editClass" title="Изменить класс">
              <Pen class="w-4 h-4"/>
            </IconButton>
            <!-- <IconButton @click="deleteClass" title="Удалить класс">
              <Trash class="w-4 h-4"/>
            </IconButton> -->
          </div>
        </div>

        <!-- Переключатель вкладок -->
        <div class="flex flex-wrap gap-2 mb-6">
          <button 
            @click="activeTab = 'main'"
            :class="{
              'bg-blue-500 text-gray-900': activeTab === 'main',
              'bg-gray-700 hover:bg-gray-600': activeTab !== 'main'
            }"
            class="px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Навыки
          </button>
          
          <button 
            @click="activeTab = 'abilities'"
            :class="{
              'bg-blue-500 text-gray-900': activeTab === 'abilities',
              'bg-gray-700 hover:bg-gray-600': activeTab !== 'abilities'
            }"
            class="px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Особые силы
          </button>
          
          <div class="relative">
            <button 
              @click="showSubclasses = !showSubclasses"
              class="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Подклассы
              <ChevronDown v-if="!showSubclasses" class="w-4 h-4"/>
              <ChevronUp v-else class="w-4 h-4"/>
            </button>
            
            <div 
              v-if="showSubclasses"
              class="absolute z-10 mt-1 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700"
            >
              <button 
                v-for="subclass in subclasses"
                :key="subclass.id"
                @click="activeTab = `subclass-${subclass.id}`; showSubclasses = false;"
                class="block w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                {{ subclass.name }}
              </button>
            </div>
          </div>
        </div>

        <!-- Контент вкладок -->
        <div v-if="activeTab === 'main'">
          <!-- Основные характеристики -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div>
              <h3 class="text-2xl font-bold mb-4">Основные характеристики:</h3>
              <p class="mb-2"><b>Кость хитов:</b> 1к{{ currentClass.hit_dice }} за каждый уровень</p>
              <p class="mb-2"><b>Хиты на 1 уровне:</b> {{ currentClass.hit_dice }} (или {{ Math.floor(currentClass.hit_dice/2) + 1 }}) + ваш модификатор <b>Телосложения</b></p>
              <p><b>Базовая характеристика:</b> {{ currentClass.base_stats }}</p>
            </div>
          </div>

          <!-- Таблица уровней -->
          <div v-if="currentClass.features?.levels?.length" class="mb-12">
            <h3 class="text-2xl font-bold mb-4">Таблица прогрессии уровней</h3>
            <div class="overflow-x-auto border border-gray-600 rounded-lg">
              <table class="w-full ">
              <thead>
                <tr class="bg-gray-700">
                  <th 
                    v-for="column in currentClass.features.columns" 
                    :key="column.key"
                    class="p-2 border border-gray-600 text-left"
                  >
                    {{ column.title }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="level in currentClass.features.levels" 
                  :key="level.level"
                  class="hover:bg-gray-700/50"
                >
                  <td 
                    v-for="column in currentClass.features.columns" 
                    :key="column.key"
                    class="p-2 border border-gray-600"
                  >
                    <template v-if="column.key === 'level'">
                      {{ level.level }}
                    </template>
                    <template v-else-if="column.key === 'bm'">
                      +{{ level.bm }}
                    </template>
                    <template v-else-if="column.key === 'skills'">
                      <div v-for="(skill, i) in level.skills" :key="i" class="mb-1 last:mb-0">
                        {{ skill.name }}<span v-if="i < level.skills.length - 1">,</span>
                      </div>
                    </template>
                    <template v-else>
                      {{ level[column.key] || '—' }}
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>

          <!-- Владения и снаряжение -->
          <div v-if="currentClass.proficiencies" class="mb-8 bg-gray-700/30 p-6 rounded-lg">
            <div class="prose prose-invert max-w-none">
            <!-- Владения -->
            <h3 class="text-xl mb-2">Владения</h3>
            <h4><strong>Броня:</strong> {{ currentClass.proficiencies.armor || '—' }}</h4>
            
            <h4><strong>Оружие:</strong></h4>
            <ul v-if="currentClass.proficiencies.weapons?.length">
              <li v-for="(weapon, index) in currentClass.proficiencies.weapons" :key="index">
                {{ weapon }}
              </li>
            </ul>
            <p v-else>—</p>
            
            <p><strong>Инструменты:</strong> {{ currentClass.proficiencies.tools || '—' }}</p>
            
            <p><strong>Спасброски:</strong> 
              <span v-if="currentClass.proficiencies.savingThrows?.length">
                {{ currentClass.proficiencies.savingThrows.join(', ') }}
              </span>
              <span v-else>-</span>
            </p>
            
            <p><strong>Навыки:</strong> {{ currentClass.proficiencies.skills || '—' }}</p>
            
            <!-- Снаряжение -->
            <h3 class="text-xl mb-4">Снаряжение</h3>
            <ul v-if="currentClass.proficiencies.equipment?.length">
              <li v-for="(item, index) in currentClass.proficiencies.equipment" :key="index">
                {{ item }}
              </li>
            </ul>
            <p v-else>—</p>
          </div>
          </div>

          <!-- Описание навыков -->
          <div v-if="currentClass.features?.levels?.length" class="space-y-6">
            <div v-for="level in currentClass.features.levels" :key="`desc-${level.level}`">
            <h2 class="text-3xl font-bold mb-6 pt-6 border-t border-gray-700">Уровень {{ level.level }}</h2>
            
            <div 
              v-if="level.skills && level.skills.length"
              v-for="(skill, index) in level.skills" 
              :key="`skill-${level.level}-${index}`"
              class="mb-4 bg-gray-700/30 p-4 rounded-lg"
            >
              <h3 class="text-xl font-bold mb-3 ">{{ skill.name }}</h3>
              <div 
                class="whitespace-pre-line prose prose-invert max-w-none"
                v-html="skill.description.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')"
              ></div>
            </div>
          </div>
          </div>
        </div>

        <!-- Вкладка особых сил -->
        <div v-else-if="activeTab === 'abilities'" class="bg-gray-800 rounded-xl p-6">
          <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles class="w-6 h-6"/> Особые силы
          </h2>
          <p class="text-gray-400">Здесь будут отображаться особые силы и заклинания класса</p>
        </div>

        <!-- Вкладка подкласса -->
<div v-else-if="activeTab.startsWith('subclass-')">
  <div 
    v-for="subclass in subclasses" 
    v-show="activeTab === `subclass-${subclass.id}`"
    :key="subclass.id"
    class="bg-gray-800 rounded-xl p-6 mb-6"
  >
    <!-- Режим редактирования подкласса -->
    <div v-if="isEditingSubclass && editSubclassData?.id === subclass.id" class="bg-gray-700/50 p-6 rounded-lg">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold">Редактирование подкласса</h2>
        <div class="flex gap-2">
          <IconButton @click="saveSubclass" title="Сохранить">
            <Save class="w-5 h-5"/>
          </IconButton>
          <IconButton @click="cancelEditSubclass" title="Отменить">
            <X class="w-5 h-5"/>
          </IconButton>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 mb-6">
        <div>
          <label class="block mb-2">Название подкласса</label>
          <InputField v-model="editSubclassData.name" :icon="CaseSensitive"/> 
        </div>
        <div>
          <label class="block mb-2">Описание</label>
          <textarea 
            v-model="editSubclassData.description" 
            class="flex-1 block w-full h-32 pl-3 pr-4 py-3 rounded-xl transition-all duration-300 outline-none
                  bg-gray-800 focus:bg-gray-900
                  focus:outline-none focus:ring-4 ffocus:border-transparent px-1"
          ></textarea>
        </div>
      </div>

      <!-- Редактор таблицы уровней подкласса -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-2xl font-bold">Таблица прогрессии уровней</h3>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse border border-gray-600">
            <thead>
              <tr class="bg-gray-700">
                <th class="p-2 border border-gray-600">
                  <IconButton @click="addSubclassColumn" title="Добавить колонку">
                    <Plus class="w-4 h-4"/>
                  </IconButton>
                </th>
                <th 
                  v-for="(column, colIndex) in editSubclassData.features.columns" 
                  :key="column.key"
                  class="p-2 border border-gray-600"
                >
                  <div class="flex items-center gap-2">
                    <input v-model="column.title" class="flex-1 block w-auto  pl-3 pr-4 py-3 rounded-xl transition-all duration-300 outline-none
                  bg-gray-800 focus:bg-gray-900
                  focus:outline-none focus:ring-4 ffocus:border-transparent px-1"/>
                    <IconButton @click.stop="removeSubclassColumn(colIndex)" title="Удалить колонку">
                      <Minus class="w-3 h-3"/>
                    </IconButton>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(level, levelIndex) in editSubclassData.features.levels" 
                :key="levelIndex"
                class="hover:bg-gray-700/50"
              >
                <td class="p-2 border border-gray-600">
                  <div class="flex gap-1">
                    <IconButton @click="removeSubclassLevel(levelIndex)" title="Удалить уровень">
                      <Trash class="w-4 h-4 sm:w-5 sm:h-5"/>
                    </IconButton>
                  </div>
                </td>
                <td 
                  v-for="column in editSubclassData.features.columns" 
                  :key="column.key"
                  class="p-2 border border-gray-600"
                >
                  <input 
                    v-model="level[column.key]" 
                    class="flex-1 block w-auto  pl-3 pr-4 py-3 rounded-xl transition-all duration-300 outline-none
                  bg-gray-800 focus:bg-gray-900
                  focus:outline-none focus:ring-4 ffocus:border-transparent px-1"
                    v-if="column.key !== 'features'"
                  >
                  <div v-else class="space-y-1">
                    <div 
                      v-for="(skill, skillIndex) in level.skills" 
                      :key="skillIndex"
                      class="flex items-center gap-1"
                    >
                      <input v-model="skill.name" class="flex-1 block w-auto  pl-3 pr-4 py-3 rounded-xl transition-all duration-300 outline-none
                  bg-gray-800 focus:bg-gray-900
                  focus:outline-none focus:ring-4 ffocus:border-transparent px-1">
                      <IconButton @click.stop="removeSubclassSkill(levelIndex, skillIndex)" title="Удалить навык">
                        <Minus class="w-3 h-3"/>
                      </IconButton>
                    </div>
                    <IconButton @click="addSubclassSkill(levelIndex)" title="Добавить навык">
                      <Plus class="w-3 h-3"/>
                    </IconButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <IconButton @click="addSubclassLevel" title="Добавить уровень" class="mt-2">
            <Plus class="w-4 h-4 mr-3"/> Добавить уровень
          </IconButton>
        </div>
      </div>

      <!-- Редактор описаний навыков подкласса -->
      <div v-for="(level, levelIndex) in editSubclassData.features.levels" :key="`edit-subclass-${levelIndex}`">
        <h3 class="text-xl font-bold mb-2">Уровень {{ level.level }} - Описания навыков</h3>
        <div 
          v-for="(skill, skillIndex) in level.skills" 
          :key="skillIndex"
          class="mb-4 bg-gray-700/50 p-3 rounded"
        >
          <h4 class="font-bold mb-1">{{ skill.name }}</h4>
          <textarea 
            v-model="skill.description" 
            class="flex-1 block w-full h-32 pl-3 pr-4 py-3 rounded-xl transition-all duration-300 outline-none
                  bg-gray-800 focus:bg-gray-900
                  focus:outline-none focus:ring-4 ffocus:border-transparent px-1"
            placeholder="Описание навыка..."
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Режим просмотра подкласса -->
    <div v-else>
      <div class="flex justify-between items-start mb-6">
        <h2 class="text-3xl font-bold">{{ subclass.name }}</h2>
        <div class="flex gap-2">
          <IconButton @click="editSubclass(subclass)" title="Редактировать">
            <Pen class="w-4 h-4"/>
          </IconButton>
          <IconButton @click="deleteSubclass(subclass.id)" title="Удалить">
            <Trash class="w-4 h-4"/>
          </IconButton>
        </div>
      </div>

      <p class="mb-6 prose prose-invert max-w-none">{{ subclass.description }}</p>

      <!-- Таблица прогрессии подкласса -->
      <div v-if="subclass.features?.levels?.length" class="mb-8">
        <h3 class="text-2xl font-bold mb-4">Прогрессия подкласса</h3>
        <div class="overflow-x-auto border border-gray-600 rounded-lg">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-700">
                <th 
                  v-for="column in subclass.features.columns" 
                  :key="column.key"
                  class="p-2 border border-gray-600 text-left"
                >
                  {{ column.title }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="level in subclass.features.levels" 
                :key="level.level"
                class="hover:bg-gray-700/50"
              >
                <td 
                  v-for="column in subclass.features.columns" 
                  :key="column.key"
                  class="p-2 border border-gray-600"
                >
                  <template v-if="column.key === 'level'">
                    {{ level.level }}
                  </template>
                  <template v-else-if="column.key === 'skills'">
                    <div v-for="(skill, i) in level.skills" :key="i" class="mb-1 last:mb-0">
                      {{ skill.name }}<span v-if="i < level.skills.length - 1">,</span>
                    </div>
                  </template>
                  <template v-else>
                    {{ level[column.key] || '—' }}
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Описание навыков подкласса -->
      <div v-if="subclass.features?.levels?.length" class="space-y-6">
        <div v-for="level in subclass.features.levels" :key="`subclass-desc-${level.level}`">
          <h2 class="text-2xl font-bold mb-4 pt-4 border-t border-gray-700">Уровень {{ level.level }}</h2>
          
          <div 
            v-if="level.skills && level.skills.length"
            v-for="(skill, index) in level.skills" 
            :key="`subclass-skill-${level.level}-${index}`"
            class="mb-4 bg-gray-700/30 p-4 rounded-lg"
          >
            <h3 class="text-xl font-bold mb-2">{{ skill.name }}</h3>
            <div 
              class="whitespace-pre-line prose prose-invert max-w-none"
              v-html="skill.description.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
      </div>
    </div>

    <!-- Модальное окно подкласса -->
    <Modal v-if="isSubclassModalOpen" :show="isSubclassModalOpen" @close="isSubclassModalOpen = false">
      <div class="bg-gray-800 p-6 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-4">
          {{ editingSubclass.id ? 'Редактирование' : 'Создание' }} подкласса
        </h2>
        
        <div class="grid gap-4 mb-6">
          <InputField 
            v-model="editingSubclass.name" 
            label="Название подкласса"
            :icon="CaseSensitive"
          />
          <textarea
            v-model="editingSubclass.description"
            class="w-full h-32 p-2 bg-gray-700 rounded"
            placeholder="Описание подкласса..."
          ></textarea>
        </div>
        
        <!-- Редактор таблицы подкласса (аналогично основному классу) -->
        <div class="mb-8">
          <h3 class="text-xl font-bold mb-4">Таблица прогрессии</h3>
          <!-- ... (реализация аналогична редактору основной таблицы) ... -->
        </div>
        
        <div class="flex justify-end gap-2">
          <button @click="isSubclassModalOpen = false" class="px-4 py-2 bg-gray-700 rounded">
            Отмена
          </button>
          <button @click="saveSubclass" class="px-4 py-2 bg-amber-500 text-gray-900 rounded">
            Сохранить
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>