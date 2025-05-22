<script setup>
import VisibilityToggle from '@/components/VisibilityToggle.vue'

defineProps({
  spells: Array,
  spellLevels: Array
});

const emit = defineEmits(['view']);
</script>

<template>
  <div class="space-y-6">
    <VisibilityToggle 
    v-for="level in spellLevels" 
    :key="level"
    :content-id="`desc-spell-${level}`"
    content-type="desc-spell">
      <div v-if="spells.filter(s => s.level === level).length > 0" class="mb-6">
        <h3 class="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
          {{ level === 'Природные силы' ? level : `${level} уровень` }}
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="spell in spells.filter(s => s.level === level).sort((a, b) => a.name.localeCompare(b.name))" 
            :key="spell.id"
            @click="emit('view', spell)"
            class="bg-gray-700/30 p-4 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
          >
            <div class="flex justify-between items-start">
              <h4 class="text-lg font-bold">{{ spell.name }}</h4>
              <span class="text-sm bg-gray-600 px-2 py-1 rounded">
                {{ spell.level === 'Природные силы' ? 'Природная сила' : `${spell.level} ур.` }}
              </span>
            </div>
            
            <div class="flex gap-2 mt-2 text-sm">
              <span v-if="spell.verbal" class="bg-blue-600/30 px-2 rounded">В</span>
              <span v-if="spell.somatic" class="bg-green-600/30 px-2 rounded">С</span>
              <span v-if="spell.material" class="bg-amber-600/30 px-2 rounded">М</span>
            </div>
          </div>
        </div>
      </div>
    </VisibilityToggle>
  </div>
</template>