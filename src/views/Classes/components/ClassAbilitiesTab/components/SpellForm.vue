<script setup>
import InputField from '@/components/UI/Inputs/InputField.vue';
import {CaseSensitive, Clock, Timer, LandPlot, X, Save, HandCoins } from 'lucide-vue-next'
import IconButton from '@/components/UI/Button/IconButton.vue';


defineProps({
  spell: Object,
  spellLevels: Array,
  spellSchools: Array,
  mode: String
});

defineEmits(['save', 'cancel']);
</script>

<template>
  <div class="mb-6 p-4 bg-gray-700/50 rounded-lg">
    <h3 class="text-lg font-bold mb-3">{{ mode === 'create' ? 'Новое заклинание' : 'Редактирование заклинания' }}</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block mb-2">Название</label>
        <InputField 
          v-model="spell.name"
          placeholder="Название"
          :icon="CaseSensitive"/>
      </div>
      <!-- <div>
        <label class="block mb-1">Школа</label>
        <select v-model="spell.school" class="w-full p-2 bg-gray-700 rounded">
          <option v-for="school in spellSchools" :key="school" :value="school">{{ school }}</option>
        </select>
      </div> -->
      <div>
        <label class="block mb-1">Уровень</label>
        <select v-model="spell.level" class="flex-1 block w-full pl-3 pr-4 py-3 rounded-xl transition-all duration-300 outline-none
              bg-gray-800 focus:bg-gray-900
              focus:outline-none focus:ring-4 ffocus:border-transparent px-1">
          <option v-for="level in spellLevels" :key="level" :value="level">{{ level }}</option>
        </select>
      </div>
      <div>
        <label class="block mb-2">Время накладывания</label>
        <InputField 
          v-model="spell.casting_time"
          placeholder="Время накладывания"
          :icon="Clock"/>
      </div>
      <div>
        <label class="block mb-2">Дистанция</label>
        <InputField 
          v-model="spell.distance"
          placeholder="Дистанция"
          :icon="LandPlot"/>
      </div>
      <div>
        <label class="block mb-2">Длительность</label>
        <InputField 
          v-model="spell.duration"
          placeholder="Длительность"
          :icon="Timer"/>
      </div>
      <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="flex items-center">
        <input type="checkbox" id="verbal" v-model="spell.verbal" class="mr-2">
        <label for="verbal">Вербальный</label>
      </div>
      <div class="flex items-center">
        <input type="checkbox" id="somatic" v-model="spell.somatic" class="mr-2">
        <label for="somatic">Соматический</label>
      </div>
      <div class="flex items-center">
        <input type="checkbox" id="material" v-model="spell.material" class="mr-2">
        <label for="material">Материальный</label>
      </div>
    </div>


    <div>
      <label class="block mb-2">Описание</label>
      <textarea
        v-model="spell.description"
        class="flex-1 block w-full h-32 pl-3 pr-4 py-3 my-3 rounded-xl transition-all duration-300 outline-none
                bg-gray-800 focus:bg-gray-900
                focus:outline-none focus:ring-4 ffocus:border-transparent px-1"
        placeholder="Описание заклинания..."
      ></textarea>
    </div>

    <div v-if="spell.material">
        <label class="block mb-2">Материальные компоненты</label>
        <InputField 
          v-model="spell.material_description" 
          class="mt-4"
          :icon="HandCoins"
        />
      </div>
    </div>
    
    
    
    
    
    <div class="flex justify-end gap-2 mt-4">
      <IconButton @click="$emit('cancel')" title="Отменить">
          <X class="w-5 h-5"/>
      </IconButton>
      <IconButton @click="$emit('save')" title="Сохранить">
          <Save class="w-5 h-5"/>
      </IconButton>
    </div>
  </div>
</template>