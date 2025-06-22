<script setup>
import { ref } from 'vue';
import IconButton from '@/components/UI/Button/IconButton.vue';
import InputField from '@/components/UI/Inputs/InputField.vue';
import { Save, X, Plus, Minus, CaseSensitive, Trash } from 'lucide-vue-next';

const props = defineProps({
  subclass: Object
});

const emit = defineEmits(['save', 'cancel']);

const editData = ref(JSON.parse(JSON.stringify(props.subclass)));

const addColumn = () => {
  if (!editData.value.features) {
    editData.value.features = { columns: [], levels: [] };
  }
  editData.value.features.columns.push({
    key: `newColumn${editData.value.features.columns.length + 1}`,
    title: 'Новая колонка'
  });
};

const removeColumn = (index) => {
  editData.value.features.columns.splice(index, 1);
};

const addLevel = () => {
  if (!editData.value.features) {
    editData.value.features = { columns: [], levels: [] };
  }
  
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
</script>

<template>
  <div class="bg-gray-700/50 p-6 rounded-lg">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-3xl font-bold">Редактирование подкласса</h2>
      <div class="flex gap-2">
        <IconButton @click="emit('save', editData)" title="Сохранить">
          <Save class="w-5 h-5"/>
        </IconButton>
        <IconButton @click="emit('cancel')" title="Отменить">
          <X class="w-5 h-5"/>
        </IconButton>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 mb-6">
      <div>
        <label class="block mb-2">Название подкласса</label>
        <InputField v-model="editData.name" :icon="CaseSensitive"/> 
      </div>
      <div>
        <label class="block mb-2">Описание</label>
        <textarea 
          v-model="editData.description" 
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
                  <input v-model="column.title" class="flex-1 block w-auto pl-3 pr-4 py-3 rounded-xl transition-all duration-300 outline-none bg-gray-800 focus:bg-gray-900 focus:outline-none focus:ring-4 ffocus:border-transparent px-1"/>
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
                  class="flex-1 block w-auto pl-3 pr-4 py-3 rounded-xl transition-all duration-300 outline-none bg-gray-800 focus:bg-gray-900 focus:outline-none focus:ring-4 ffocus:border-transparent px-1"
                  v-if="column.key !== 'features'"
                >
                <div v-else class="space-y-1">
                  <div 
                    v-for="(skill, skillIndex) in level.skills" 
                    :key="skillIndex"
                    class="flex items-center gap-1"
                  >
                    <input v-model="skill.name" class="flex-1 block w-auto pl-3 pr-4 py-3 rounded-xl transition-all duration-300 outline-none bg-gray-800 focus:bg-gray-900 focus:outline-none focus:ring-4 ffocus:border-transparent px-1">
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
        <IconButton @click="addLevel" title="Добавить уровень" class="mt-2">
          <Plus class="w-4 h-4 mr-3"/> Добавить уровень
        </IconButton>
      </div>
    </div>

    <!-- Редактор описаний навыков подкласса -->
    <div v-for="(level, levelIndex) in editData.features.levels" :key="`edit-subclass-${levelIndex}`">
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
</template>