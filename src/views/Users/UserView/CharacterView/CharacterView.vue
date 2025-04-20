<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { Edit, Trash, Plus, Minus, ChevronUp, ChevronDown } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const characterId = route.params.id

const character = ref({
  name: '',
  class_name: '',
  race_name: '',
  level: 1,
  alignment: '',
  background: '',
  experience: 0,
  inspiration: false,
  stats: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  },
  saving_throws: [],
  skills: [],
  equipment: [],
  abilities: [],
  spells: [],
  attacks: [],
  features: [],
  traits: {
    personality: '',
    ideals: '',
    bonds: '',
    flaws: ''
  }
})

const loading = ref(true)
const editMode = ref(false)
const hp = ref({ current: 10, max: 10, temp: 0 })
const hitDice = ref({ total: 1, current: 1 })

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const fetchCharacter = async () => {
  try {
    const response = await axios.get(`${API_URL}/characters/${characterId}`)
    Object.assign(character.value, response.data)
    
    // Инициализация HP если нет в базе
    if (!character.value.max_hp) {
      character.value.max_hp = calculateMaxHP()
    }
    hp.value = {
      current: character.value.current_hp || character.value.max_hp,
      max: character.value.max_hp,
      temp: character.value.temp_hp || 0
    }
    
    // Инициализация костей хитов
    if (!character.value.hit_dice) {
      character.value.hit_dice = `1d${character.value.class_name === 'Бард' ? 8 : 6}`
    }
    hitDice.value = {
      total: character.value.level,
      current: character.value.level
    }
    
  } catch (err) {
    console.error('Ошибка загрузки:', err)
  } finally {
    loading.value = false
  }
}

const calculateMaxHP = () => {
  const conMod = getModifier(character.value.stats.constitution)
  const base = character.value.level * (6 + conMod) // Для простоты - все классы d6
  return base > 0 ? base : 1
}

const getModifier = (value) => {
  return Math.floor((value - 10) / 2)
}

const saveCharacter = async () => {
  try {
    const response = await axios.put(`${API_URL}/characters/${characterId}`, {
      ...character.value,
      current_hp: hp.value.current,
      max_hp: hp.value.max,
      temp_hp: hp.value.temp,
      hit_dice: `${hitDice.value.current}d${character.value.hit_dice?.split('d')[1] || 6}`
    })
    Object.assign(character.value, response.data)
    editMode.value = false
  } catch (err) {
    console.error('Ошибка сохранения:', err)
  }
}

const updateStat = (stat, value) => {
  const numValue = parseInt(value) || 0
  character.value.stats[stat] = Math.max(1, Math.min(30, numValue))
}

const addAttack = () => {
  character.value.attacks.push({
    name: 'Новая атака',
    bonus: 0,
    damage: '1d6',
    type: ''
  })
}

const removeAttack = (index) => {
  character.value.attacks.splice(index, 1)
}

const addEquipment = () => {
  character.value.equipment.push('Новый предмет')
}

const removeEquipment = (index) => {
  character.value.equipment.splice(index, 1)
}

const addSpell = () => {
  character.value.spells.push({
    name: 'Новое заклинание',
    level: 0,
    description: ''
  })
}

const removeSpell = (index) => {
  character.value.spells.splice(index, 1)
}

const adjustHP = (amount) => {
  hp.value.current = Math.min(hp.value.max, Math.max(0, hp.value.current + amount))
}

const isOwner = computed(() => {
  return authStore.user?.id === character.value.user_id || authStore.user?.role === 'master'
})

onMounted(fetchCharacter)
</script>

<template>
  <div v-if="loading" class="flex justify-center py-8">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>

  <div v-else class="character-sheet bg-gray-900 text-white p-4 max-w-6xl mx-auto">
    <!-- Режим редактирования -->
    <div v-if="isOwner" class="flex justify-end mb-4 gap-2">
      <button
        v-if="!editMode"
        @click="editMode = true"
        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-1"
      >
        <Edit :size="16" /> Редактировать
      </button>
      <button
        v-else
        @click="saveCharacter"
        class="px-3 py-1 bg-green-600 hover:bg-green-700 rounded flex items-center gap-1"
      >
        Сохранить
      </button>
      <button
        v-if="editMode"
        @click="editMode = false"
        class="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded"
      >
        Отмена
      </button>
    </div>

    <!-- Верхняя часть листа -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <!-- Блок информации -->
      <div class="bg-gray-800 p-4 rounded-lg">
        <div v-if="editMode">
          <input
            v-model="character.name"
            class="w-full p-2 bg-gray-700 border border-gray-600 rounded mb-2 text-xl font-bold"
            placeholder="Имя персонажа"
          />
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm text-gray-300 mb-1">Класс</label>
              <input
                v-model="character.class_name"
                class="w-full p-1 bg-gray-700 border border-gray-600 rounded"
              />
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">Уровень</label>
              <input
                v-model.number="character.level"
                type="number"
                min="1"
                max="20"
                class="w-full p-1 bg-gray-700 border border-gray-600 rounded"
              />
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">Раса</label>
              <input
                v-model="character.race_name"
                class="w-full p-1 bg-gray-700 border border-gray-600 rounded"
              />
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">Мировоззрение</label>
              <input
                v-model="character.alignment"
                class="w-full p-1 bg-gray-700 border border-gray-600 rounded"
              />
            </div>
          </div>
        </div>
        <div v-else>
          <h1 class="text-2xl font-bold mb-2">{{ character.name }}</h1>
          <div class="space-y-1">
            <p><span class="font-semibold">Класс и уровень:</span> {{ character.class_name }} {{ character.level }}</p>
            <p><span class="font-semibold">Раса:</span> {{ character.race_name }}</p>
            <p><span class="font-semibold">Мировоззрение:</span> {{ character.alignment }}</p>
            <p><span class="font-semibold">Предыстория:</span> {{ character.background }}</p>
          </div>
        </div>
      </div>

      <!-- Блок характеристик -->
      <div class="bg-gray-800 p-4 rounded-lg">
        <div class="grid grid-cols-3 gap-2">
          <div v-for="(value, stat) in character.stats" :key="stat" class="text-center">
            <label class="block text-sm font-medium mb-1 uppercase">{{ stat }}</label>
            <div v-if="editMode" class="flex items-center justify-center">
              <button @click="updateStat(stat, value - 1)" class="p-1 text-gray-400 hover:text-white">
                <Minus :size="14" />
              </button>
              <input
                v-model.number="character.stats[stat]"
                type="number"
                min="1"
                max="30"
                class="w-12 text-center bg-gray-700 border border-gray-600 rounded mx-1"
                @change="updateStat(stat, $event.target.value)"
              />
              <button @click="updateStat(stat, value + 1)" class="p-1 text-gray-400 hover:text-white">
                <Plus :size="14" />
              </button>
            </div>
            <div v-else>
              <div class="text-2xl font-bold">{{ value }}</div>
              <div class="text-sm" :class="{'text-green-400': getModifier(value) >= 0, 'text-red-400': getModifier(value) < 0}">
                {{ getModifier(value) >= 0 ? '+' : '' }}{{ getModifier(value) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Блок HP и инициативы -->
      <div class="bg-gray-800 p-4 rounded-lg">
        <div class="space-y-3">
          <div>
            <div class="flex justify-between items-center mb-1">
              <span class="font-semibold">Хиты</span>
              <span v-if="!editMode" class="text-sm">{{ hp.current }}/{{ hp.max }}</span>
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model.number="hp.current"
                type="number"
                min="0"
                :max="hp.max"
                class="flex-1 p-1 bg-gray-700 border border-gray-600 rounded"
                :disabled="!editMode"
              />
              <span v-if="editMode" class="flex items-center gap-1">
                <button @click="adjustHP(-1)" class="p-1 hover:bg-gray-700 rounded">
                  <Minus :size="14" />
                </button>
                <button @click="adjustHP(1)" class="p-1 hover:bg-gray-700 rounded">
                  <Plus :size="14" />
                </button>
              </span>
            </div>
            <div v-if="editMode" class="mt-1">
              <label class="block text-sm text-gray-300 mb-1">Макс. хиты</label>
              <input
                v-model.number="hp.max"
                type="number"
                min="1"
                class="w-full p-1 bg-gray-700 border border-gray-600 rounded"
              />
            </div>
          </div>
          
          <div>
            <label class="block font-semibold mb-1">Инициатива</label>
            <div class="text-xl">{{ getModifier(character.stats.dexterity) }}</div>
          </div>
          
          <div>
            <label class="block font-semibold mb-1">КД</label>
            <div class="text-xl">10 + {{ getModifier(character.stats.dexterity) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Основное содержимое -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Левая колонка -->
      <div class="space-y-4">
        <!-- Спасброски -->
        <div class="bg-gray-800 p-4 rounded-lg">
          <h2 class="font-bold text-lg mb-3 border-b border-gray-700 pb-1">Спасброски</h2>
          <div v-for="(value, stat) in character.stats" :key="'save-'+stat" class="flex items-center mb-2">
            <input
              type="checkbox"
              v-model="character.saving_throws"
              :value="stat"
              :disabled="!editMode"
              class="mr-2 h-4 w-4"
            />
            <span class="capitalize flex-1">{{ stat }}</span>
            <span class="font-bold">{{ getModifier(value) >= 0 ? '+' : '' }}{{ getModifier(value) }}</span>
          </div>
        </div>

        <!-- Навыки -->
        <div class="bg-gray-800 p-4 rounded-lg">
          <h2 class="font-bold text-lg mb-3 border-b border-gray-700 pb-1">Навыки</h2>
          <div v-for="skill in [
            {name: 'Акробатика', stat: 'dexterity'},
            {name: 'Анализ', stat: 'intelligence'},
            {name: 'Атлетика', stat: 'strength'},
            {name: 'Внимательность', stat: 'wisdom'},
            {name: 'Выживание', stat: 'wisdom'},
            {name: 'Выступление', stat: 'charisma'},
            {name: 'Запугивание', stat: 'charisma'},
            {name: 'История', stat: 'intelligence'},
            {name: 'Ловкость рук', stat: 'dexterity'},
            {name: 'Магия', stat: 'intelligence'},
            {name: 'Медицина', stat: 'wisdom'},
            {name: 'Обман', stat: 'charisma'},
            {name: 'Природа', stat: 'intelligence'},
            {name: 'Проницательность', stat: 'wisdom'},
            {name: 'Религия', stat: 'intelligence'},
            {name: 'Скрытность', stat: 'dexterity'},
            {name: 'Убеждение', stat: 'charisma'},
            {name: 'Уход за животными', stat: 'wisdom'}
          ]" :key="skill.name" class="flex items-center mb-2">
            <input
              type="checkbox"
              v-model="character.skills"
              :value="skill.name"
              :disabled="!editMode"
              class="mr-2 h-4 w-4"
            />
            <span class="flex-1">{{ skill.name }} ({{ skill.stat.slice(0, 3) }})</span>
            <span class="font-bold">{{ getModifier(character.stats[skill.stat]) >= 0 ? '+' : '' }}{{ getModifier(character.stats[skill.stat]) }}</span>
          </div>
        </div>
      </div>

      <!-- Центральная колонка -->
      <div class="space-y-4">
        <!-- Атаки -->
        <div class="bg-gray-800 p-4 rounded-lg">
          <div class="flex justify-between items-center mb-3">
            <h2 class="font-bold text-lg border-b border-gray-700 pb-1">Атаки</h2>
            <button
              v-if="editMode"
              @click="addAttack"
              class="p-1 text-blue-400 hover:text-blue-300"
              title="Добавить атаку"
            >
              <Plus :size="16" />
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-left border-b border-gray-700">
                  <th class="pb-1">Название</th>
                  <th class="pb-1">Бонус</th>
                  <th class="pb-1">Урон</th>
                  <th v-if="editMode" class="pb-1"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(attack, index) in character.attacks" :key="index" class="border-b border-gray-700">
                  <td class="py-2">
                    <input
                      v-if="editMode"
                      v-model="attack.name"
                      class="w-full bg-gray-700 border border-gray-600 rounded p-1"
                    />
                    <span v-else>{{ attack.name }}</span>
                  </td>
                  <td>
                    <input
                      v-if="editMode"
                      v-model="attack.bonus"
                      type="number"
                      class="w-12 bg-gray-700 border border-gray-600 rounded p-1"
                    />
                    <span v-else>+{{ attack.bonus }}</span>
                  </td>
                  <td>
                    <input
                      v-if="editMode"
                      v-model="attack.damage"
                      class="w-20 bg-gray-700 border border-gray-600 rounded p-1"
                    />
                    <span v-else>{{ attack.damage }}</span>
                  </td>
                  <td v-if="editMode" class="text-right">
                    <button
                      @click="removeAttack(index)"
                      class="p-1 text-red-400 hover:text-red-300"
                      title="Удалить"
                    >
                      <Trash :size="14" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Снаряжение -->
        <div class="bg-gray-800 p-4 rounded-lg">
          <div class="flex justify-between items-center mb-3">
            <h2 class="font-bold text-lg border-b border-gray-700 pb-1">Снаряжение</h2>
            <button
              v-if="editMode"
              @click="addEquipment"
              class="p-1 text-blue-400 hover:text-blue-300"
              title="Добавить предмет"
            >
              <Plus :size="16" />
            </button>
          </div>
          <ul class="space-y-1">
            <li v-for="(item, index) in character.equipment" :key="index" class="flex items-center">
              <input
                v-if="editMode"
                v-model="character.equipment[index]"
                class="flex-1 bg-gray-700 border border-gray-600 rounded p-1 mr-2"
              />
              <span v-else class="flex-1">{{ item }}</span>
              <button
                v-if="editMode"
                @click="removeEquipment(index)"
                class="p-1 text-red-400 hover:text-red-300"
                title="Удалить"
              >
                <Trash :size="14" />
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Правая колонка -->
      <div class="space-y-4">
        <!-- Черты характера -->
        <div class="bg-gray-800 p-4 rounded-lg">
          <h2 class="font-bold text-lg mb-3 border-b border-gray-700 pb-1">Черты характера</h2>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium mb-1">Черты личности</label>
              <textarea
                v-model="character.traits.personality"
                :disabled="!editMode"
                class="w-full bg-gray-700 border border-gray-600 rounded p-2 h-20"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Идеалы</label>
              <textarea
                v-model="character.traits.ideals"
                :disabled="!editMode"
                class="w-full bg-gray-700 border border-gray-600 rounded p-2 h-20"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Привязанности</label>
              <textarea
                v-model="character.traits.bonds"
                :disabled="!editMode"
                class="w-full bg-gray-700 border border-gray-600 rounded p-2 h-20"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Слабости</label>
              <textarea
                v-model="character.traits.flaws"
                :disabled="!editMode"
                class="w-full bg-gray-700 border border-gray-600 rounded p-2 h-20"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Особенности и заклинания -->
        <div class="bg-gray-800 p-4 rounded-lg">
          <h2 class="font-bold text-lg mb-3 border-b border-gray-700 pb-1">Особенности</h2>
          <div class="space-y-2">
            <div v-for="(feature, index) in character.features" :key="index" class="bg-gray-700 p-2 rounded">
              <input
                v-if="editMode"
                v-model="feature.name"
                class="w-full bg-gray-600 border border-gray-500 rounded p-1 mb-1 font-bold"
              />
              <h3 v-else class="font-bold">{{ feature.name }}</h3>
              <textarea
                v-model="feature.description"
                :disabled="!editMode"
                class="w-full bg-gray-600 border border-gray-500 rounded p-1 text-sm"
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.character-sheet {
  font-family: 'Noto Sans', sans-serif;
}

input[type="checkbox"] {
  accent-color: #3b82f6;
}

textarea {
  resize: none;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>