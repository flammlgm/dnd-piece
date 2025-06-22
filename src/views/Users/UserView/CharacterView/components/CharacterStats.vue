<script setup>
import { Minus, Plus } from 'lucide-vue-next' 

const props = defineProps({
    character: Object,
  editMode: Boolean,
  getModifier: Function
})

const updateStat = (stat, value) => {
  const numValue = parseInt(value) || 0
  props.character.stats[stat] = Math.max(1, Math.min(30, numValue))
}
</script>

<template>
  <div class="bg-gray-800 p-4 rounded-lg font-mono pt-4">
    <h1 class="text-2xl font-bold mb-4" v-if="!editMode" >Характеристики</h1>
    <div class="grid grid-cols-3 gap-2">
      <div v-for="(value, stat) in character.stats" :key="stat" class="text-center">
        <label class="block text-sm font-medium mb-1 uppercase">{{ stat }}</label>
        <div v-if="editMode" class="flex items-center justify-center">
          <button @click="updateStat(stat, value - 1)" class="p-1 text-gray-400 hover:text-white">
            <Minus :size="14" />
          </button>
          <input
            v-model.number="character.stats[stat]"
            min="1"
            max="30"
            class="w-14 text-center bg-gray-700 border border-gray-600 rounded mx-1"
            @change="updateStat(stat, $event.target.value)"
          />
          <button @click="updateStat(stat, value + 1)" class="p-1 text-gray-400 hover:text-white">
            <Plus :size="14" />
          </button>
        </div>
        <div v-else class>
          <div class="text-2xl font-bold">{{ value }}</div>
          <div class="text-sm" :class="{'text-green-400': getModifier(value) >= 0, 'text-red-400': getModifier(value) < 0}">
            {{ getModifier(value) >= 0 ? '+' : '' }}{{ getModifier(value) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>