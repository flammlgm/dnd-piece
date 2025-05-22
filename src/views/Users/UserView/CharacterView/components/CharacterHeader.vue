<script setup>
import InputField from '@/components/UI/Inputs/InputField.vue';
import { ALargeSmall, Sword, Dna, ArrowBigUp, Smile} from 'lucide-vue-next';

defineProps({
  character: Object,
  editMode: Boolean
})
</script>

<template>
  <div class="bg-gray-800 p-4 rounded-lg font-mono">
    <div v-if="editMode">
      <label class="block text-sm text-gray-300">Имя</label>
      <InputField
        :icon="ALargeSmall"
        v-model="character.name"
        class="w-full p-2 mb-2 text-xl font-bold"
        placeholder="Имя персонажа"
      />
      
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-sm text-gray-300 mb-1">Класс</label>
          <InputField
            :icon="Sword"
            v-model="character.class_name"
            class="w-full p-1"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-300 mb-1">Раса</label>
          <InputField
          :icon="Dna"
            v-model="character.race_name"
            class="w-full p-1"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-300 mb-1">Уровень</label>
          <InputField
          :icon="ArrowBigUp"
            v-model.number="character.level"
            type="number"
            min="1"
            max="20"
            class="w-full p-1"
          />
        </div>
        
        
       
      </div>
      <div>
          <label class="block text-sm text-gray-300 my-1">Мировоззрение</label>
          <InputField
          :icon="Smile"
            v-model="character.alignment"
            class="w-full p-1"
          />
        </div>
    </div>
    <div v-else>
      <h1 class="text-2xl font-bold mb-2">{{ character.name }}</h1>
      <div class="space-y-4 text-lg">
        <p class="flex"><ArrowBigUp class="mr-2"/><span class="font-semibold">Уровень:</span> {{ character.level }}</p>
        <p class="flex"><Sword class="mr-2"/><span class="font-semibold">Класс-подкласс:</span> {{ character.class_name }}</p>
        <p class="flex"><Dna class="mr-2"/><span class="font-semibold">Раса:</span> {{ character.race_name }}</p>
        <p class="flex"><Smile class="mr-2"/><span class="font-semibold">Мировоззрение:</span> {{ character.alignment }}</p>
      </div>
    </div>
  </div>
</template>