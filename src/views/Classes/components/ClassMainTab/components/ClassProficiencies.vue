<script setup>
defineProps({
  proficiencies: Object
});
</script>

<template>
  <div v-if="proficiencies" class="mb-8 bg-gray-700/30 p-6 rounded-lg">
    <div class="prose prose-invert max-w-none">
      <h3 class="text-xl mb-2">Владения</h3>
      <h4><strong>Броня:</strong> {{ proficiencies.armor || '-' }}</h4>
      
      <h4><strong>Оружие:</strong></h4>
      <ul v-if="proficiencies.weapons?.length">
        <li v-for="(weapon, index) in proficiencies.weapons" :key="index">
          {{ weapon }}
        </li>
      </ul>
      <p v-else>-</p>
      
      <p><strong>Инструменты:</strong> {{ proficiencies.tools || '-' }}</p>
      
      <p><strong>Спасброски: </strong> 
        <span v-if="proficiencies.savingThrows?.length">
          {{ proficiencies.savingThrows.join(', ') }}
        </span>
        <span v-else>-</span>
      </p>
      
      <p><strong>Навыки:</strong> {{ proficiencies.skills || '-' }}</p>
      
      <h3 class="text-xl mb-4">Снаряжение</h3>
      <ul v-if="proficiencies.equipment?.length">
        <li v-for="(item, index) in proficiencies.equipment" :key="index">
          {{ item }}
        </li>
      </ul>
      <p v-else>-</p>
    </div>
  </div>
</template>