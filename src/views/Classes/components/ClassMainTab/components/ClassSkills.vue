<script setup>
defineProps({
  features: Object
});
</script>

<template>
  <div v-if="features?.levels?.length" class="space-y-6">
    <div v-for="level in features.levels" :key="`desc-${level.level}`">
      <h2 class="text-3xl font-bold mb-6 pt-6 border-t border-gray-700">Уровень {{ level.level }}</h2>
      
      <div 
        v-if="level.skills && level.skills.length"
        v-for="(skill, index) in level.skills" 
        :key="`skill-${level.level}-${index}`"
        class="mb-4 bg-gray-700/30 p-4 rounded-lg"
      >
        <h3 class="text-xl font-bold mb-3">{{ skill.name }}</h3>
        <div 
          class="whitespace-pre-line prose prose-invert max-w-none"
          v-html="skill.description.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')"
        ></div>
      </div>
    </div>
  </div>
</template>