<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import CharacterHeader from './components/CharacterHeader.vue'
import CharacterStats from './components/CharacterStats.vue'
import CharacterHealth from './components/CharacterHealth.vue'
import CharacterSaves from './components/CharacterSaves.vue'
import CharacterSkills from './components/CharacterSkills.vue'
import CharacterAttacks from './components/CharacterAttacks.vue'
import CharacterEquipment from './components/CharacterEquipment.vue'
import CharacterTraits from './components/CharacterTraits.vue'
import CharacterFeatures from './components/CharacterFeatures.vue'
import IconButton from '@/components/UI/Button/IconButton.vue';
import { Pen, Trash, Save, X, ALargeSmall, Plus } from 'lucide-vue-next';
import InputField from '@/components/UI/Inputs/InputField.vue';

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
  },
  armor_class: 10
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
    
    if (!character.value.max_hp) {
      character.value.max_hp = calculateMaxHP()
    }
    hp.value = {
      current: character.value.current_hp || character.value.max_hp,
      max: character.value.max_hp,
      temp: character.value.temp_hp || 0
    }
    
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
  const base = character.value.level * (6 + conMod)
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

const isOwner = computed(() => {
  return authStore.user?.id === character.value.user_id || authStore.user?.role === 'master'
})

onMounted(fetchCharacter)
</script>

<template>
  <div v-if="loading" class="flex justify-center py-8">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>

  <div v-else class="character-sheet bg-gray-900  text-white p-4 max-w-6xl mx-auto">
    <!-- Режим редактирования -->
    <div v-if="isOwner" class="flex justify-end mb-4 gap-2">
      <IconButton
        v-if="!editMode"
        @click="editMode = true"
        title="Редактировать"
      >
        <Pen class="w-5 h-5"/>
      </IconButton>
      <IconButton
        v-else
        @click="saveCharacter"
        title="Сохранить"
      >
        <Save class="w-5 h-5"/>
      </IconButton>
      <IconButton
        v-if="editMode"
        @click="editMode = false"
        title="Отменить"
      >
        <X class="w-5 h-5"/>
      </IconButton>
    </div>

    <!-- Верхняя часть листа -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <CharacterHeader 
        :character="character" 
        :editMode="editMode" 
      />
      
      <CharacterStats 
        :character="character" 
        :editMode="editMode" 
        :getModifier="getModifier"
      />
      
      <CharacterHealth 
        :character="character" 
        :editMode="editMode" 
        :hp="hp" 
        :getModifier="getModifier"
      />
    </div>

    <!-- Основное содержимое -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Левая колонка -->
      <div class="space-y-4">
        <CharacterSaves 
          :character="character" 
          :editMode="editMode" 
          :getModifier="getModifier"
        />
        
        <CharacterSkills 
          :character="character" 
          :editMode="editMode" 
          :getModifier="getModifier"
        />
      </div>

      <!-- Центральная колонка -->
      <div class="space-y-4">
        <CharacterAttacks 
          :character="character" 
          :editMode="editMode" 
        />
        
        <CharacterEquipment 
          :character="character" 
          :editMode="editMode" 
        />
      </div>

      <!-- Правая колонка -->
      <div class="space-y-4">
        <CharacterTraits 
          :character="character" 
          :editMode="editMode" 
        />
        
        <CharacterFeatures 
          :character="character" 
          :editMode="editMode" 
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.character-sheet {
  font-family: 'Noto Sans', sans-serif;
}
</style>