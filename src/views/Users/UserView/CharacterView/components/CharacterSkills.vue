<script setup>
const props = defineProps({
  character: Object,
  editMode: Boolean,
  getModifier: Function
})

const skillsList = [
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
]

const hasSkill = (skillName) => {
  return Array.isArray(props.character.skills) && props.character.skills.includes(skillName)
}

const toggleSkill = (skillName, checked) => {
  if (!props.editMode) return
  
  if (!Array.isArray(props.character.skills)) {
    props.character.skills = []
  }
  
  if (checked) {
    props.character.skills.push(skillName)
  } else {
    props.character.skills = props.character.skills.filter(s => s !== skillName)
  }
}

const getModifierColor = (stat) => {
  const mod = props.getModifier(props.character.stats[stat])
  if (mod > 0) return 'text-green-400'
  if (mod < 0) return 'text-red-400'
  return 'text-white'
}
</script>

<template>
  <div class="bg-gray-800 p-4 rounded-lg font-mono">
    <h2 class="font-bold text-lg mb-3 border-b border-gray-700 pb-1">Навыки</h2>
    <div v-for="skill in skillsList" :key="skill.name" class="flex items-center mb-2">
      <input
        type="checkbox"
        :checked="hasSkill(skill.name)"
        @change="e => toggleSkill(skill.name, e.target.checked)"
        :disabled="!editMode"
        class="mr-2 h-4 w-4 rounded-md bg-slate-300 checked:bg-slate-600 checked:hover:bg-slate-700"
      />
      <span class="flex-1">{{ skill.name }} ({{ skill.stat.slice(0, 3) }})</span>
      <span class="font-bold" :class="getModifierColor(skill.stat)">
        {{ getModifier(character.stats[skill.stat]) >= 0 ? '+' : '' }}{{ getModifier(character.stats[skill.stat]) }}
      </span>
    </div>
  </div>
</template>