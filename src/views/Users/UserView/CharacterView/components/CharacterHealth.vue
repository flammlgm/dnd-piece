<script setup>
import { Minus, Plus, Activity, ArrowDownAZ, Shield } from 'lucide-vue-next'
import InputField from '@/components/UI/Inputs/InputField.vue';

const props = defineProps({
  character: Object,
  editMode: Boolean,
  hp: Object,
  getModifier: Function
})

const adjustHP = (amount) => {
  props.hp.current = Math.min(props.hp.max, Math.max(0, props.hp.current + amount))
}
</script>

<template>
  <div class="bg-gray-800 p-4 rounded-lg font-mono text-lg">
    <div class="space-y-3 ">
      <h1 class="text-2xl font-bold mb-2" v-if="!editMode">Хиты и КД</h1>

      <div>
        <div class="flex justify-between items-center mb-1">
          
          <p class="flex"><Activity class="mr-2"/><span class="font-semibold">Хиты:</span> <span v-if="!editMode" class="px-4">{{ hp.current }}/{{ hp.max }}</span></p>

        </div>
        <div class="flex items-center gap-2">
          <InputField
            :icon="Activity"
            v-model.number="hp.current"
            min="0"
            :max="hp.max"
            class="flex-1 p-1"
            v-if="editMode"
          />
          
          <span v-if="editMode" class="flex items-center gap-1">
            <button @click="adjustHP(-1)" class="p-1 hover:bg-gray-700 rounded">
              <Minus :size="14" />
            </button>
            <button @click="adjustHP(1)" class="p-1 hover:bg-gray-700 rounded">
              <Plus :size="14" />
            </button>
          </span>
        </div>
        <div v-if="editMode" class="mt-1">
          <label class="block  mb-1 font-semibold">Макс. хиты</label>
          <InputField
            :icon="Activity"
            v-model.number="hp.max"
            min="1"
            class="w-full p-1"
          />
        </div>
      </div>
      
      <div>
        <p class="flex" v-if="!editMode"><ArrowDownAZ class="mr-2"/><span class="font-semibold">Инициатива:</span> <span  class="px-4">+{{ getModifier(character.stats.dexterity) }}</span></p>
      </div>
      <span class="font-semibold" v-if="editMode">КД:</span>
      <div>
        <InputField
          :icon="Shield"
          v-if="editMode"
          v-model.number="character.armor_class"
          min="1"
          class="w-full p-1"
        />
        <div v-else class="text-xl ">
          <p class="flex mt-5"><Shield class="mr-2"/><span class="font-semibold">КД:</span> <span v-if="!editMode" class="px-4">{{ character.armor_class}}</span></p>
        </div>
      </div>
    </div>
  </div>

</template>