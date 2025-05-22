<script setup>
import { Plus, Trash } from 'lucide-vue-next'
import InputField from '@/components/UI/Inputs/InputField.vue';

const props = defineProps({
  character: Object,
  editMode: Boolean
})

const addAttack = () => {
  if (!Array.isArray(props.character.attacks)) {
    props.character.attacks = []
  }
  props.character.attacks.push({
    name: 'Новая атака',
    bonus: 0,
    damage: '1d6',
    type: ''
  })
}

const removeAttack = (index) => {
  if (Array.isArray(props.character.attacks)) {
    props.character.attacks.splice(index, 1)
  }
}
</script>

<template>
  <div class="bg-gray-800 p-4 rounded-lg font-mono">
    <div class="flex justify-between items-center mb-3">
      <h2 class="font-bold text-lg border-b border-gray-700 pb-1">Атаки</h2>
      <button
        v-if="editMode"
        @click="addAttack"
        class="p-1 text-blue-400 hover:text-blue-300"
        title="Добавить атаку"
      >
        <Plus :size="16" />
      </button>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="text-left border-b border-gray-700">
            <th class="pb-1">Название</th>
            <th class="pb-1 pl-2">Бонус</th>
            <th class="pb-1">Урон</th>
            <th v-if="editMode" class="pb-1"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(attack, index) in character.attacks" :key="index" class="">
            <td class="py-2">
              <input
                v-if="editMode"
                v-model="attack.name"
                class="w-full bg-gray-700 border rounded p-1"
              />
              <span v-else>{{ attack.name }}</span>
            </td>
            <td class="p-2">
              <input
                v-if="editMode"
                v-model.number="attack.bonus"
                type="number"
                class="w-12 bg-gray-700 border border-gray-600 rounded p-1"
              />
              <span v-else>+{{ attack.bonus }}</span>
            </td>
            <td>
              <input
                v-if="editMode"
                v-model="attack.damage"
                class="w-20 bg-gray-700 border border-gray-600 rounded p-1"
              />
              <span v-else>{{ attack.damage }}</span>
            </td>
            <td v-if="editMode" class="text-right">
              <button
                @click="removeAttack(index)"
                class="p-1 text-red-400 hover:text-red-300"
                title="Удалить"
              >
                <Trash :size="14" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>