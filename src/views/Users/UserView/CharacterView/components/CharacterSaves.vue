<script setup>
const props = defineProps({
  character: Object,
  editMode: Boolean,
  getModifier: Function
})

const toggleSave = (stat, event) => {
  if (!props.editMode) return
  
  if (!Array.isArray(props.character.saving_throws)) {
    props.character.saving_throws = []
  }
  
  if (event.target.checked) {
    props.character.saving_throws.push(stat)
  } else {
    props.character.saving_throws = props.character.saving_throws.filter(s => s !== stat)
  }
}

const hasSave = (stat) => {
  return Array.isArray(props.character.saving_throws) && props.character.saving_throws.includes(stat)
}

const getModifierColor = (value) => {
  const mod = props.getModifier(value)
  if (mod > 0) return 'text-green-400'
  if (mod < 0) return 'text-red-400'
  return 'text-white'
}
</script>

<template>
  <div class="bg-gray-800 p-4 rounded-lg font-mono">
    <h2 class="font-bold text-lg mb-3 border-b border-gray-700 pb-1">Спасброски</h2>
    <div v-for="(value, stat) in character.stats" :key="'save-'+stat" class="flex items-center mb-2">
      <input
        type="checkbox"
        :checked="hasSave(stat)"
        @change="e => toggleSave(stat, e)"
        :disabled="!editMode"
        class="mr-2 h-4 w-4 rounded-md bg-slate-300 checked:bg-slate-600 checked:hover:bg-slate-700 "
      />
      <span class="capitalize flex-1">{{ stat }}</span>
      <span class="font-bold" :class="getModifierColor(value)">
        {{ getModifier(value) >= 0 ? '+' : '' }}{{ getModifier(value) }}
      </span>
    </div>
  </div>
</template>