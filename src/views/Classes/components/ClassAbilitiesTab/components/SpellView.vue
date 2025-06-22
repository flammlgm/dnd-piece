<script setup>
import Modal from '@/components/UI/Modal.vue';
import IconButton from '@/components/UI/Button/IconButton.vue';
import { Pen, Trash, X } from 'lucide-vue-next';
import {useAuthStore} from '@/stores/auth.js'

const authStore = useAuthStore()
defineProps({
  spell: Object
});

defineEmits(['edit', 'delete', 'close']);
</script>

<template>
  <Modal 
    title="Особая сила" 
    :show="true" 
    @close="$emit('close')"
  >
    <div class="bg-gray-800 p-6 rounded-xl max-w-5xl w-full">
      <div class="flex space-x-2 items-start">
        <h3 class="text-xl font-bold">{{ spell.name }}</h3>
        <IconButton @click="$emit('edit', spell)" title="Редактировать" v-if="authStore.user?.role === 'master'">
            <Pen class="w-4 h-4"/>
          </IconButton>
          <IconButton @click="$emit('delete', spell.id)" title="Удалить" v-if="authStore.user?.role === 'master'">
            <Trash class="w-4 h-4"/>
          </IconButton>
          
      </div>
      <p class="text-sm text-gray-500 font-style: italic mb-4">{{ spell.level === 'Природные силы' ? 'Природные силы' : spell.level + ' уровень' }}</p>

        <div class="overflow-x-auto border border-gray-600 rounded-lg">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-700">
              <th class="p-2 border border-gray-600 text-left"
              >
              Время накладывания
            </th>
            <th class="p-2 border border-gray-600 text-left"
              >
              Дистанция
            </th>
            <th class="p-2 border border-gray-600 text-left"
              >
              Длительность
            </th>
            <th class="p-2 border border-gray-600 text-left"
              >
              Компоненты
            </th>
            </tr>
          </thead>
          <tbody>
            <tr 
              class="hover:bg-gray-700/50"
            >
              <td 
                class="p-2 border border-gray-600"
              >
              <p class="text-lg">{{ spell.casting_time }}</p>
              </td>
              <td 
                class="p-2 border border-gray-600"
              >
              <p class="text-lg">{{ spell.distance }}</p>
              </td>
              <td 
                class="p-2 border border-gray-600"
              >
              <p class="text-lg">{{ spell.duration }}</p>
              </td>
              <td 
                class="p-2 border border-gray-600"
              >
              <p class="text-lg">
              <span v-if="spell.verbal">Вербальный</span>
              <span v-if="spell.verbal && spell.somatic">, </span>
              <span v-if="spell.somatic">Соматический</span>
              <span v-if="(spell.verbal || spell.somatic) && spell.material">, </span>
              <span v-if="spell.material">Материальный ({{ spell.material_description }})</span>
              <span v-if="!spell.verbal && !spell.somatic && !spell.material">-</span>
            </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>


      <div class="my-6">
        <div class="prose prose-invert max-w-none whitespace-pre-line">
          {{ spell.description }}
        </div>
      </div>
    </div>
  </Modal>
</template>