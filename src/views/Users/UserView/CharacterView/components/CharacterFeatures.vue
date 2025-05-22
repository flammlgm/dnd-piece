<script setup>
import { Plus, Trash, ChevronDown, ChevronUp } from 'lucide-vue-next'
import { ref } from 'vue'

const props = defineProps({
  character: Object,
  editMode: Boolean
})

const expandedFeatures = ref([])

const toggleFeature = (index) => {
  const idx = expandedFeatures.value.indexOf(index)
  if (idx === -1) {
    expandedFeatures.value.push(index)
  } else {
    expandedFeatures.value.splice(idx, 1)
  }
}

const addFeature = () => {
  if (!Array.isArray(props.character.features)) {
    props.character.features = []
  }
  const newIndex = props.character.features.length
  props.character.features.push({
    name: 'Новая особенность',
    description: ''
  })
  expandedFeatures.value.push(newIndex)
}

const removeFeature = (index) => {
  if (Array.isArray(props.character.features)) {
    props.character.features.splice(index, 1)
    // Удаляем индекс из expandedFeatures если он там есть
    const idx = expandedFeatures.value.indexOf(index)
    if (idx !== -1) {
      expandedFeatures.value.splice(idx, 1)
    }
    // Обновляем оставшиеся индексы
    expandedFeatures.value = expandedFeatures.value.map(i => i > index ? i - 1 : i)
  }
}
</script>

<template>
  <div class="bg-gray-800 p-4 rounded-lg font-mono">
    <div class="flex justify-between items-center mb-3">
      <h2 class="font-bold text-lg border-b border-gray-700 pb-1">Особенности</h2>
      <button
        v-if="editMode"
        @click="addFeature"
        class="p-1 text-blue-400 hover:text-blue-300"
        title="Добавить особенность"
      >
        <Plus :size="16" />
      </button>
    </div>
    <div class="space-y-2">
      <div v-for="(feature, index) in character.features" :key="index" class="bg-gray-700 rounded overflow-hidden">
        <button
          @click="toggleFeature(index)"
          class="w-full flex justify-between items-center p-2 hover:bg-gray-600 transition-colors"
        >
          <div class="flex items-center">
            <input
              v-if="editMode"
              v-model="feature.name"
              @click.stop
              class="bg-gray-600 border border-gray-500 rounded p-1 font-bold mr-2"
            />
            <h3 v-else class="font-bold">{{ feature.name }}</h3>
          </div>
          <div class="flex items-center">
            <button
              v-if="editMode"
              @click.stop="removeFeature(index)"
              class="p-1 text-red-400 hover:text-red-300 ml-2"
              title="Удалить"
            >
              <Trash :size="14" />
            </button>
            <span class="ml-2">
              <ChevronDown v-if="!expandedFeatures.includes(index)" :size="16" />
              <ChevronUp v-else :size="16" />
            </span>
          </div>
        </button>
        <div v-if="expandedFeatures.includes(index)" class="p-2 pt-0">
          <textarea
            v-model="feature.description"
            v-if="editMode"
            :disabled="!editMode"
            class="w-full bg-gray-600 border border-gray-500 rounded p-1 mt-2 text-sm"
            rows="3"
          ></textarea>
          <p class="mt-2" v-if="!editMode">{{feature.description}}</p>
        </div>
      </div>
    </div>
  </div>
</template>