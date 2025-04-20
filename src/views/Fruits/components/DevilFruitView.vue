<script setup>
import Modal from '@/components/UI/Modal.vue';
import IconButton from '@/components/UI/Button/IconButton.vue';
import { Pen, Trash, X } from 'lucide-vue-next';

defineProps({
  fruit: Object
});

defineEmits(['edit', 'delete', 'close']);
</script>

<template>
  <Modal 
    title="Дьявольский фрукт" 
    :show="true" 
    @close="$emit('close')"
  >
    <div class="bg-gray-800 p-6 rounded-xl w-[900px]">
      <div class="flex space-x-2 items-start">
        <h3 class="text-xl font-bold">{{ fruit.name }}</h3>
        <IconButton @click="$emit('edit', fruit)" title="Редактировать">
          <Pen class="w-4 h-4"/>
        </IconButton>
        <IconButton @click="$emit('delete', fruit.id)" title="Удалить">
          <Trash class="w-4 h-4"/>
        </IconButton>
          
      </div>
      <p class="text-sm text-gray-500 font-style: italic mb-4">{{ fruit.type }}  {{ fruit.abilities.rarity }}</p>



      <div class="mb-6">
        <h4 class="text-lg font-bold mb-2">Описание</h4>
        <div class="prose prose-invert max-w-none whitespace-pre-line">
          {{ fruit.description }}
        </div>
      </div>

      <div class="mb-6" v-if="fruit.appearance">
        <h4 class="text-lg font-bold mb-2">Внешний вид</h4>
        <div class="prose prose-invert max-w-none whitespace-pre-line">
          {{ fruit.appearance }}
        </div>
      </div>

      <div class="mb-6" v-if="fruit.abilities.features && fruit.abilities.features.length">
        <h4 class="text-lg font-bold mb-2">Способности</h4>
        <div class="space-y-4">
          <div 
            v-for="(feature, index) in fruit.abilities.features" 
            :key="index"
            class="bg-gray-700 p-4 rounded-lg"
          >
            <h5 class="text-xl font-semibold mb-2">{{ feature.name }}</h5>
            <div class="prose prose-invert max-w-none whitespace-pre-line">
              {{ feature.description }}
            </div>
          </div>
        </div>
      </div>

      <template v-if="fruit.type === 'Zoan' && fruit.creature">
        <div class="mb-6">
          <h4 class="text-lg font-bold mb-2">Форма существа: {{ fruit.creature.name }}</h4>
          
          <div class="overflow-x-auto border border-gray-600 rounded-lg mb-4">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-700">
                  <th class="p-2 border border-gray-600 text-left">Размер</th>
                  <th class="p-2 border border-gray-600 text-left">КД</th>
                  <th class="p-2 border border-gray-600 text-left">Хиты</th>
                  <th class="p-2 border border-gray-600 text-left">Скорость</th>
                </tr>
              </thead>
              <tbody>
                <tr class="hover:bg-gray-700/50">
                  <td class="p-2 border border-gray-600">{{ fruit.creature.size }}</td>
                  <td class="p-2 border border-gray-600">{{ fruit.creature.ac }}</td>
                  <td class="p-2 border border-gray-600">{{ fruit.creature.hp }}</td>
                  <td class="p-2 border border-gray-600">{{ fruit.creature.speed }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h5 class="text-lg font-bold mb-2">Характеристики</h5>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
            <div v-for="(value, stat) in fruit.creature.stats" :key="stat">
              <span class="capitalize">{{ stat }}:</span> {{ value }}
            </div>
          </div>

          <div v-if="fruit.creature.skills" class="mb-4">
            <h5 class="text-lg font-bold mb-2">Владения</h5>
            <p>{{ fruit.creature.skills }}</p>
          </div>

          <div v-if="fruit.creature.abilities" class="mb-4">
            <h5 class="text-lg font-bold mb-2">Способности существа</h5>
            <div class="prose prose-invert max-w-none whitespace-pre-line">
              {{ fruit.creature.abilities }}
            </div>
          </div>
        </div>
      </template>
    </div>
  </Modal>
</template>