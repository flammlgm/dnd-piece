<script setup>
defineProps({
  features: Object
});
</script>

<template>
  <div v-for="(level, levelIndex) in features.levels" :key="`edit-${levelIndex}`">
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
</template>