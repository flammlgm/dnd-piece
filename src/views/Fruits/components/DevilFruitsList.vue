<script setup>
import VisibilityToggle from '@/components/VisibilityToggle.vue'

defineProps({
  fruits: Array,
  fruitTypes: Array,
  rarityTypes: Array
});

const emit = defineEmits(['view']);
</script>

<template>
  <div class="space-y-8">
    <div v-for="type in fruitTypes" :key="type">
      <div v-if="fruits.filter(f => f.type === type).length > 0" class="mb-8">
        <h2 class="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">
          {{ type }}
        </h2>
        <div v-for="rarity in rarityTypes" :key="rarity">
          <div v-if="fruits.filter(f => f.type === type && f.abilities.rarity === rarity).length > 0" class="mb-6">
            <h3 class="text-xl font-semibold mb-3">{{ rarity }}</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <VisibilityToggle
              v-for="fruit in fruits.filter(f => f.type === type && f.abilities.rarity === rarity).sort((a, b) => a.name.localeCompare(b.name))" 
                :key="fruit.id"
                :content-id="`fruit-${fruit.id}`"
                content-type="fruit"
                >
              <div 
                @click="emit('view', fruit)"
                class="bg-gray-700/30 p-4 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
              >
                <div class="flex justify-between items-start">
                  <h4 class="text-lg font-bold">{{ fruit.name }}</h4>

                </div>
                
              </div>
            </VisibilityToggle>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>