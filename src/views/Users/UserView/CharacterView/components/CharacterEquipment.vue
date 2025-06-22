<script setup>
import { Plus, Trash } from 'lucide-vue-next'

const props = defineProps({
  character: Object,
  editMode: Boolean
})

const addEquipment = () => {
  if (!Array.isArray(props.character.equipment)) {
    props.character.equipment = []
  }
  props.character.equipment.push('Новый предмет')
}

const removeEquipment = (index) => {
  if (Array.isArray(props.character.equipment)) {
    props.character.equipment.splice(index, 1)
  }
}
</script>

<template>
  <div class="bg-gray-800 p-4 rounded-lg font-mono">
    <div class="flex justify-between items-center mb-3">
      <h2 class="font-bold text-lg border-b border-gray-700 pb-1">Снаряжение</h2>
      <button
        v-if="editMode"
        @click="addEquipment"
        class="p-1 text-blue-400 hover:text-blue-300"
        title="Добавить предмет"
      >
        <Plus :size="16" />
      </button>
    </div>
    <ul class="space-y-1">
      <li v-for="(item, index) in character.equipment" :key="index" class="flex items-center">
        <input
          v-if="editMode"
          v-model="character.equipment[index]"
          class="flex-1 bg-gray-700 border border-gray-600 rounded p-1 mr-2 my-1"
        />
        <span v-else class="flex-1">- {{ item }}</span>
        <button
          v-if="editMode"
          @click="removeEquipment(index)"
          class="p-1 text-red-400 hover:text-red-300"
          title="Удалить"
        >
          <Trash :size="14" />
        </button>
      </li>
    </ul>
  </div>
</template>