<script setup>
import { computed } from 'vue';
import IconButton from '@/components/UI/Button/IconButton.vue';
import { Pen, Trash } from 'lucide-vue-next';

const props = defineProps({
  subclass: Object
});

const emit = defineEmits(['edit']);

const features = computed(() => props.subclass.features || {
  columns: [],
  levels: []
});
</script>

<template>
  <div class="bg-gray-800 rounded-xl p-6 mb-6">
    <div class="flex justify-between items-start mb-6">
      <h2 class="text-3xl font-bold">{{ subclass.name }}</h2>
      <div class="flex gap-2">
        <IconButton @click="emit('edit', subclass)" title="Редактировать">
          <Pen class="w-4 h-4"/>
        </IconButton>
        <IconButton @click="deleteSubclass(subclass.id)" title="Удалить">
          <Trash class="w-4 h-4"/>
        </IconButton>
      </div>
    </div>

    <p class="mb-6">{{ subclass.description }}</p>

    <!-- Таблица прогрессии подкласса -->
    <div v-if="features.levels?.length" class="mb-8">
      <h3 class="text-2xl font-bold mb-4">Прогрессия подкласса</h3>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse border border-gray-600">
          <thead>
            <tr class="bg-gray-700">
              <th 
                v-for="column in features.columns" 
                :key="column.key"
                class="p-2 border border-gray-600 text-left"
              >
                {{ column.title }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="level in features.levels" 
              :key="level.level"
              class="hover:bg-gray-700/50"
            >
              <td 
                v-for="column in features.columns" 
                :key="column.key"
                class="p-2 border border-gray-600"
              >
                {{ level[column.key] || '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>