<script setup>
import { ref } from 'vue';
import IconButton from '@/components/UI/Button/IconButton.vue';
import InputField from '@/components/UI/Inputs/InputField.vue';
import ClassEditTable from './components/ClassEditTable.vue';
import ClassEditProficiencies from './components/ClassEditProficiencies.vue';
import ClassEditSkills from './components/ClassEditSkills.vue';
import { Save, X, CaseSensitive, Dices, BicepsFlexed } from 'lucide-vue-next';

const props = defineProps({
  classData: Object
});

const emit = defineEmits(['save', 'cancel']);

const editData = ref(JSON.parse(JSON.stringify(props.classData)));

// Инициализация proficiencies если они отсутствуют
if (!editData.value.proficiencies) {
  editData.value.proficiencies = {
    armor: '',
    weapons: [],
    tools: '',
    savingThrows: [],
    skills: '',
    equipment: []
  };
}

editData.value.proficiencies.weaponsStr = editData.value.proficiencies.weapons?.join(', ') || '';
editData.value.proficiencies.savingThrowsStr = editData.value.proficiencies.savingThrows?.join(', ') || '';

const updateWeaponsList = () => {
  editData.value.proficiencies.weapons = editData.value.proficiencies.weaponsStr
    .split(',')
    .map(w => w.trim())
    .filter(w => w);
  
  editData.value.proficiencies.savingThrows = editData.value.proficiencies.savingThrowsStr
    .split(',')
    .map(st => st.trim())
    .filter(st => st);
};

const save = () => {
  updateWeaponsList();
  emit('save', editData.value);
};

// Методы для таблицы
const addColumn = () => {
  editData.value.features.columns.push({
    key: `newColumn${editData.value.features.columns.length + 1}`,
    title: 'Новая колонка'
  });
};

const removeColumn = (index) => {
  editData.value.features.columns.splice(index, 1);
};

const addLevel = () => {
  const newLevel = { level: editData.value.features.levels.length + 1 };
  editData.value.features.columns.forEach(col => {
    if (col.key === 'skills') {
      newLevel[col.key] = [];
    } else {
      newLevel[col.key] = '';
    }
  });
  editData.value.features.levels.push(newLevel);
};

const removeLevel = (index) => {
  editData.value.features.levels.splice(index, 1);
};

const addSkill = (levelIndex) => {
  if (!editData.value.features.levels[levelIndex].skills) {
    editData.value.features.levels[levelIndex].skills = [];
  }
  editData.value.features.levels[levelIndex].skills.push({
    name: '',
    description: ''
  });
};

const removeSkill = (levelIndex, skillIndex) => {
  editData.value.features.levels[levelIndex].skills.splice(skillIndex, 1);
};

const addEquipment = () => {
  editData.value.proficiencies.equipment.push('');
};

const removeEquipment = (index) => {
  editData.value.proficiencies.equipment.splice(index, 1);
};
</script>

<template>
  <div class="bg-gray-800 rounded-2xl p-6 mb-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-4xl font-bold">Редактирование класса</h1>
      <div class="flex gap-2">
        <IconButton @click="save" title="Сохранить">
          <Save class="w-5 h-5"/>
        </IconButton>
        <IconButton @click="$emit('cancel')" title="Отменить">
          <X class="w-5 h-5"/>
        </IconButton>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div>
        <label class="block mb-2">Название класса</label>
        <InputField v-model="editData.name" :icon="CaseSensitive"/> 
      </div>
      <div>
        <label class="block mb-2">Кость хитов</label>
        <InputField v-model="editData.hit_dice" :icon="Dices"/> 
      </div>
      <div>
        <label class="block mb-2">Базовая характеристика</label>
        <InputField v-model="editData.base_stats" :icon="BicepsFlexed"/> 
      </div>
    </div>

    <ClassEditTable 
      :features="editData.features"
      @add-column="addColumn"
      @remove-column="removeColumn"
      @add-level="addLevel"
      @remove-level="removeLevel"
      @add-skill="addSkill"
      @remove-skill="removeSkill"
    />

    <ClassEditProficiencies 
      :proficiencies="editData.proficiencies"
      @update-weapons="updateWeaponsList"
      @add-equipment="addEquipment"
      @remove-equipment="removeEquipment"
    />

    <ClassEditSkills :features="editData.features" />
  </div>
</template>