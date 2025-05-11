<script setup>
import IconButton from '@/components/UI/Button/IconButton.vue';
import { Pen, Trash } from 'lucide-vue-next';
import {useAuthStore} from '@/stores/auth.js'
import VisibilityToggle from '@/components/VisibilityToggle.vue'

const authStore = useAuthStore()
defineProps({
  subclass: Object
});

defineEmits(['edit', 'delete']);
</script>

<template>
  <div>
    <div class="flex justify-between items-start mb-6">
      <h2 class="text-3xl font-bold">{{ subclass.name }}</h2>
      <div class="flex gap-2" v-if="authStore.user?.role === 'master'">
        <IconButton @click="$emit('edit', subclass)" title="Редактировать">
          <Pen class="w-4 h-4"/>
        </IconButton>
        <!-- <IconButton @click="$emit('delete', subclass.id)" title="Удалить">
          <Trash class="w-4 h-4"/>
        </IconButton> -->
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
                  {{ level[column.key] || '-' }}
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Описание навыков подкласса -->
    <div v-if="subclass.features?.levels?.length" class="space-y-6">
      <VisibilityToggle 
      v-for="level in subclass.features.levels" 
      :key="`subclass-desc-${level.level}`"
      :content-id="`subclass-desc-${level.level}`"
      content-type="subclass-desc">
      
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
      </VisibilityToggle>
    </div>
  </div>
</template>