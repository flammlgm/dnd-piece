<script setup>
defineProps({
  features: Object
});
</script>

<template>
  <div v-if="features?.levels?.length" class="mb-12">
    <h3 class="text-2xl font-bold mb-4">Таблица прогрессии уровней</h3>
    <div class="overflow-x-auto border border-gray-600 rounded-lg">
      <table class="w-full">
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
                {{ level[column.key] || '-' }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>