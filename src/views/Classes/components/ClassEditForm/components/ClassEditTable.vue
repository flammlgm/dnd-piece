<script setup>
import IconButton from '@/components/UI/Button/IconButton.vue';
import { Plus, Minus, Trash } from 'lucide-vue-next';

const props = defineProps({
  features: Object
});

const emit = defineEmits([
  'add-column',
  'remove-column',
  'add-level',
  'remove-level',
  'add-skill',
  'remove-skill'
]);

const addLevel = () => {
  const newLevel = { level: props.features.levels.length + 1 };
  props.features.columns.forEach(col => {
    if (col.key === 'skills') {
      newLevel[col.key] = [];
    } else {
      newLevel[col.key] = '';
    }
  });
  props.features.levels.push(newLevel);
};
</script>

<template>
  <div class="mb-8">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-2xl font-bold">Таблица прогрессии уровней</h3>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full border-collapse border border-gray-600">
        <thead>
          <tr class="bg-gray-700">
            <th class="p-2 border border-gray-600">
              <IconButton @click="$emit('add-column')" title="Добавить колонку">
                <Plus class="w-4 h-4"/>
              </IconButton>
            </th>
            <th 
              v-for="(column, colIndex) in features.columns" 
              :key="column.key"
              class="p-2 border border-gray-600"
            >
              <div class="flex items-center gap-2">
                <input v-model="column.title" class="flex-1 block w-auto pl-3 pr-4 py-3 rounded-xl transition-all duration-300 outline-none bg-gray-800 focus:bg-gray-900 focus:outline-none focus:ring-4 ffocus:border-transparent px-1"/>
                <IconButton @click.stop="$emit('remove-column', colIndex)" title="Удалить колонку">
                  <Minus class="w-3 h-3"/>
                </IconButton>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(level, levelIndex) in features.levels" 
            :key="levelIndex"
            class="hover:bg-gray-700/50"
          >
            <td class="p-2 border border-gray-600">
              <div class="flex gap-1">
                <IconButton @click="$emit('remove-level', levelIndex)" title="Удалить уровень">
                  <Trash class="w-4 h-4 sm:w-5 sm:h-5"/>
                </IconButton>
              </div>
            </td>
            <td 
              v-for="column in features.columns" 
              :key="column.key"
              class="p-2 border border-gray-600"
            >
              <input 
                v-model="level[column.key]" 
                class="w-full block pl-3 py-3 rounded-xl transition-all duration-300 outline-none bg-gray-800 focus:bg-gray-900 focus:outline-none focus:ring-4 ffocus:border-transparent px-1"
                v-if="column.key !== 'skills'"
              >
              <div v-else class="space-y-1">
                <div 
                  v-for="(skill, skillIndex) in level.skills" 
                  :key="skillIndex"
                  class="flex items-center gap-1"
                >
                  <input v-model="skill.name" class="flex-1 block w-auto pl-3 pr-4 py-3 rounded-xl transition-all duration-300 outline-none bg-gray-800 focus:bg-gray-900 focus:outline-none focus:ring-4 ffocus:border-transparent px-1">
                  <IconButton @click.stop="$emit('remove-skill', levelIndex, skillIndex)" title="Удалить навык">
                    <Minus class="w-3 h-3"/>
                  </IconButton>
                </div>
                <IconButton @click="$emit('add-skill', levelIndex)" title="Добавить навык">
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
</template>