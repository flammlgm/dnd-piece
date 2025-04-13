<script setup>
import IconButton from '@/components/UI/Button/IconButton.vue';
import InputField from '@/components/UI/Inputs/InputField.vue';
import { Plus, Minus, Sword, Shield, Hammer, Skull, Beaker, Backpack } from 'lucide-vue-next';

defineProps({
  proficiencies: Object
});

defineEmits(['update-weapons', 'add-equipment', 'remove-equipment']);
</script>

<template>
  <div class="mb-8 bg-gray-700/50 p-4 rounded-lg">
    <h3 class="text-xl font-bold mb-4">Владения и снаряжение</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="md:col-span-2">
        <label class="block mb-2">Оружие (через запятую):</label>
        <InputField 
          v-model="proficiencies.weaponsStr" 
          @change="$emit('update-weapons')"
          placeholder="Простое оружие, Длинный меч, Рапира"
          :icon="Sword"/>
      </div>
      
      <div>
        <label class="block mb-2">Броня:</label>
        <InputField 
          v-model="proficiencies.armor"
          @change="$emit('update-weapons')"
          placeholder="Простое оружие, Длинный меч, Рапира"
          :icon="Shield"/>
      </div>
      
      <div>
        <label class="block mb-2">Инструменты:</label>
        <InputField 
          v-model="proficiencies.tools"
          @change="$emit('update-weapons')"
          placeholder="Простое оружие, Длинный меч, Рапира"
          :icon="Hammer"/>
      </div>
      
      <div>
        <label class="block mb-2">Спасброски (через запятую):</label>
        <InputField 
          v-model="proficiencies.savingThrowsStr"
          @change="$emit('update-weapons')"
          placeholder="Простое оружие, Длинный меч, Рапира"
          :icon="Skull"/>
      </div>
      
      <div>
        <label class="block mb-2">Навыки:</label>
        <InputField 
          v-model="proficiencies.skills"
          @change="$emit('update-weapons')"
          placeholder="Простое оружие, Длинный меч, Рапира"
          :icon="Beaker"/>
      </div>
    </div>
    
    <h4 class="font-bold mb-2">Снаряжение:</h4>
    <div v-for="(item, index) in proficiencies.equipment" :key="index" class="flex mb-2">
      <InputField 
          v-model="proficiencies.equipment[index]"
          @change="$emit('update-weapons')"
          placeholder="Простое оружие, Длинный меч, Рапира"
          :icon="Backpack"
          class="w-full"/>
      <IconButton @click="$emit('remove-equipment', index)" title="Удалить" class="ml-3">
        <Minus class="w-4 h-4"/>
      </IconButton>
    </div>
    <IconButton @click="$emit('add-equipment')" title="Добавить пункт снаряжения">
      <Plus class="w-4 h-4 mr-3"/> Добавить снаряжение
    </IconButton>
  </div>
</template>