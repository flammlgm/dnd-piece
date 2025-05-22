<script setup>
import { ChevronDown, ChevronUp } from 'lucide-vue-next';
import VisibilityToggle from '@/components/VisibilityToggle.vue'

defineProps({
  activeTab: String,
  showSubclasses: Boolean,
  subclasses: Array
});

defineEmits(['update:activeTab', 'update:showSubclasses']);
</script>

<template>
  <div class="flex flex-wrap gap-2 mb-6">
    <button 
      @click="$emit('update:activeTab', 'main')"
      :class="{
        'bg-blue-600 text-white hover:bg-blue-700': activeTab === 'main',
        'bg-gray-800 border border-gray-600 hover:border-blue-600': activeTab !== 'main'
      }"
      class="px-3 py-1 rounded-lg font-medium transition-colors"
    >
      Навыки
    </button>
    
    <button 
      @click="$emit('update:activeTab', 'abilities')"
      :class="{
        'bg-blue-600 text-white hover:bg-blue-700': activeTab === 'abilities',
        'bg-gray-800 border border-gray-600 hover:border-blue-600': activeTab !== 'abilities'
      }"
      class="px-3 py-1 rounded-lg font-medium transition-colors"
    >
      Особые силы
    </button>
    
    <div class="relative">
      <button 
        @click="$emit('update:showSubclasses', !showSubclasses)"
        class="flex items-center gap-2 px-3 py-1 bg-gray-800 border border-gray-600 hover:border-blue-600 rounded-lg font-medium transition-colors"
      >
        Подклассы
        <ChevronDown v-if="!showSubclasses" class="w-4 h-4"/>
        <ChevronUp v-else class="w-4 h-4"/>
      </button>
      
      <div 
        v-if="showSubclasses"
        class="absolute z-10 mt-1 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700"
      >
      <VisibilityToggle
        v-for="subclass in subclasses"
        :key="subclass.id"
        :content-id="`subclass-${subclass.id}`"
        content-type="subclass">
        <button 
          
          @click="$emit('update:activeTab', `subclass-${subclass.id}`); $emit('update:showSubclasses', false);"
          class="block w-full text-left px-4 py-2 hover:bg-gray-700"
        >
          {{ subclass.name }}
        </button>
      </VisibilityToggle>
        
      </div>
    </div>
  </div>
</template>