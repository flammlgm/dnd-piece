<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import Spinner from '@/components/UI/Spinner.vue';
import IconButton from '@/components/UI/Button/IconButton.vue';
import InputField from '@/components/UI/Inputs/InputField.vue';
import NumberInput from '@/components/UI/Inputs/NumberInput.vue';
import { Pen, Trash, Save, X, Plus, Minus, CaseSensitive, Dices, BicepsFlexed, Sword, Shield, Hammer, Skull, Beaker, Backpack} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const classId = parseInt(route.params.id);
const currentClass = ref(null);
const isEditing = ref(false);
const editData = ref({
  name: '',
  description: '',
  hit_dice: '',
  base_stats: '',
  features: {
    columns: [],
    levels: []
  }
});

const fetchClass = async () => {
  try {
    const { data } = await axios.get(`http://localhost:5000/api/classes/${classId}`);
    currentClass.value = data;
    initEditData(data);
  } catch (err) {
    console.error('Ошибка при получении класса:', err);
  }
};

const initEditData = (data) => {
  editData.value = JSON.parse(JSON.stringify(data));
};

const editClass = () => {
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  initEditData(currentClass.value);
};

const saveClass = async () => {
  try {
    const { data } = await axios.put(`http://localhost:5000/api/classes/${classId}`, editData.value);
    currentClass.value = data;
    isEditing.value = false;
    alert('Изменения сохранены!');
  } catch (err) {
    console.error('Ошибка при сохранении:', err);
    alert('Ошибка при сохранении изменений');
  }
};

const deleteClass = async () => {
  try {
    await axios.delete(`http://localhost:5000/api/classes/${classId}`);
    alert('Класс удалён!');
    router.push('/classes');
  } catch (err) {
    console.error('Ошибка при удалении класса:', err);
    alert('Ошибка при удалении класса');
  }
};

// Функции для работы с таблицей
const addColumn = () => {
  const newCol = {
    key: `col_${Date.now()}`,
    title: 'Новая колонка'
  };
  editData.value.features.columns.push(newCol);
  
  // Добавляем поле для всех уровней
  editData.value.features.levels.forEach(level => {
    level[newCol.key] = '';
  });
};

const removeColumn = (index) => {
  const column = editData.value.features.columns[index];
  editData.value.features.columns.splice(index, 1);
  
  // Удаляем поле из всех уровней
  editData.value.features.levels.forEach(level => {
    delete level[column.key];
  });
};

const addLevel = () => {
  const newLevel = {
    level: editData.value.features.levels.length + 1,
    bm: 2,
    skills: []
  };
  
  // Добавляем все колонки
  editData.value.features.columns.forEach(col => {
    newLevel[col.key] = '';
  });
  
  editData.value.features.levels.push(newLevel);
};

const removeLevel = (index) => {
  editData.value.features.levels.splice(index, 1);
  // Обновляем номера уровней
  editData.value.features.levels.forEach((lvl, idx) => {
    lvl.level = idx + 1;
  });
};

const addSkill = (levelIndex) => {
  if (!editData.value.features.levels[levelIndex].skills) {
    editData.value.features.levels[levelIndex].skills = [];
  }
  editData.value.features.levels[levelIndex].skills.push({
    name: 'Новый навык',
    description: 'Описание навыка'
  });
};

const removeSkill = (levelIndex, skillIndex) => {
  editData.value.features.levels[levelIndex].skills.splice(skillIndex, 1);
};

const addEquipment = () => {
  if (!editData.value.proficiencies.equipment) {
    editData.value.proficiencies.equipment = [];
  }
  editData.value.proficiencies.equipment.push('');
};

const removeEquipment = (index) => {
  editData.value.proficiencies.equipment.splice(index, 1);
};

const updateWeaponsList = () => {
  editData.value.proficiencies.weapons = editData.value.proficiencies.weaponsStr
    ? editData.value.proficiencies.weaponsStr.split(',').map(w => w.trim()).filter(w => w)
    : [];
};

const updateSavingThrows = () => {
  editData.value.proficiencies.savingThrows = editData.value.proficiencies.savingThrowsStr
    ? editData.value.proficiencies.savingThrowsStr.split(',').map(st => st.trim()).filter(st => st)
    : [];
};

onMounted(fetchClass);
</script>

<template>
  <div v-if="currentClass" class="class-page bg-gray-900 text-white min-h-screen p-6">
    <!-- Режим редактирования -->
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
      <!-- Блок с изображением -->
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
            <IconButton
              @click.stop="editClass"
              title="Изменить Класс"
            >
              <Pen class="w-4 h-4 sm:w-5 sm:h-5"/>
            </IconButton>
            <IconButton
              @click.stop="deleteClass"
              title="Удалить Класс"
            >
              <Trash class="w-4 h-4 sm:w-5 sm:h-5"/>
            </IconButton>
          </div>
        </div>

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
        <div class="mb-12 " v-if="currentClass.features?.columns?.length">
          <h3 class="text-2xl font-bold mb-4">Таблица прогрессии уровней</h3>
          <div class="overflow-x-auto  border-collapse border border-gray-600   rounded-lg">
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
        <div v-if="currentClass.proficiencies" class="mb-4 bg-gray-700/30 p-6 rounded-lg">
          
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
        <!-- Описание навыков по уровням -->
        <div class="space-y-6" v-if="currentClass.features?.levels?.length">
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
    </div>
  </div>
  <div v-else class="w-full h-full flex items-center justify-center flex-1">
    <Spinner size="huge"/>
  </div>
</template>

