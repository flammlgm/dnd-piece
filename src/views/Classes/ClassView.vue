<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useClassesStore } from '@/stores/classesStore';

const route = useRoute();
const classId = parseInt(route.params.id);
const currentClass = computed(() => 
  useClassesStore.find(cls => cls.id === classId)
);

// Текущая активная вкладка
const activeTab = ref('description');
</script>

<template>
  <div v-if="currentClass" class="class-page bg-gray-900 text-white min-h-screen p-6">
    <!-- Заголовок и навигационные вкладки -->
    <div class="max-w-6xl mx-auto">
      <h1 class="text-5xl font-bold mb-6">{{ currentClass.text }}</h1>
      
      <!-- Вкладки -->
      <div class="flex border-b border-gray-700 mb-8">
        <button 
          v-for="tab in ['description', 'features', 'progression']"
          :key="tab"
          @click="activeTab = tab"
          :class="{ 'border-b-2 border-red-600': activeTab === tab }"
          class="px-4 py-2 font-semibold"
        >
          {{ 
            tab === 'description' ? 'Описание' : 
            tab === 'features' ? 'Способности' : 'Прогрессия' 
          }}
        </button>
      </div>

      <!-- Контент вкладок -->
      <div v-if="activeTab === 'description'">
        <!-- Блок описания -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-1">
            <img :src="currentClass.image" :alt="currentClass.text" class="w-full rounded-lg shadow-xl mb-6">
          </div>
          <div class="lg:col-span-2">
            <div class="bg-gray-800 p-6 rounded-lg">
              <h2 class="text-2xl font-semibold mb-4">Основное</h2>
              <p class="mb-4">{{ currentClass.description }}</p>
              <table class="w-full">
                <tr><td class="py-2 font-semibold">Кость хитов:</td><td>{{ currentClass.hitDice }}</td></tr>
                <tr><td class="py-2 font-semibold">Основная характеристика:</td><td>{{ currentClass.primaryAbility }}</td></tr>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Вкладка "Способности" -->
      <div v-if="activeTab === 'features'">
        <div class="bg-gray-800 p-6 rounded-lg">
          <h2 class="text-2xl font-semibold mb-4">Способности класса</h2>
          <div v-for="feature in currentClass.features" :key="feature.name" class="mb-6">
            <h3 class="text-xl font-semibold">{{ feature.name }} (Ур. {{ feature.level }})</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>

      <!-- Вкладка "Прогрессия" -->
      <div v-if="activeTab === 'progression'">
        <div class="bg-gray-800 p-6 rounded-lg">
          <h2 class="text-2xl font-semibold mb-4">Прогрессия по уровням</h2>
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-700">
                <th class="text-left py-2">Уровень</th>
                <th class="text-left py-2">Бонусы</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in currentClass.progression" :key="item.level" class="border-b border-gray-700">
                <td class="py-2">{{ item.level }}</td>
                <td class="py-2">{{ item.bonuses }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>