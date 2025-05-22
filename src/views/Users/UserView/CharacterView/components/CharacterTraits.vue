<script setup>
defineProps({
  character: Object,
  editMode: Boolean
})
</script>

<template>
  <div class="bg-gray-800 p-4 rounded-lg font-mono">
    <h2 class="font-bold text-lg mb-3 border-b border-gray-700 pb-1">Черты характера</h2>
    <div class="space-y-3">
      <div>
        <label class="block text-sm font-medium mb-1">Черты личности</label>
        <textarea
          v-model="character.traits.personality"
          :disabled="!editMode"
          class="w-full bg-gray-700 border border-gray-600 rounded p-2 h-20"
        ></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Идеалы</label>
        <textarea
          v-model="character.traits.ideals"
          :disabled="!editMode"
          class="w-full bg-gray-700 border border-gray-600 rounded p-2 h-20"
        ></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Привязанности</label>
        <textarea
          v-model="character.traits.bonds"
          :disabled="!editMode"
          class="w-full bg-gray-700 border border-gray-600 rounded p-2 h-20"
        ></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Слабости</label>
        <textarea
          v-model="character.traits.flaws"
          :disabled="!editMode"
          class="w-full bg-gray-700 border border-gray-600 rounded p-2 h-20"
        ></textarea>
      </div>
    </div>
  </div>
</template>