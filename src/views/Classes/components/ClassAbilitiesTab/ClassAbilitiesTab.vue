<script setup>
import { ref } from 'vue';
import SpellList from './components/SpellList.vue';
import SpellForm from './components/SpellForm.vue';
import SpellView from './components/SpellView.vue';
import IconButton from '@/components/UI/Button/IconButton.vue';
import { Plus } from 'lucide-vue-next';

const props = defineProps({
  spells: Array,
  classId: Number
});

const isCreatingSpell = ref(false);
const isEditingSpell = ref(false);
const isViewingSpell = ref(false);
const selectedSpell = ref(null);
const editingSpell = ref(null);
const newSpell = ref({
  name: 'Название',
  school: 'Школа',
  level: 'Природные силы',
  casting_time: 'Время накладывания',
  distance: 'Дистанция',
  duration: 'Длительность',
  verbal: false,
  somatic: false,
  material: false,
  material_description: 'Материальные компоненты',
  description: 'Описание',
  class_id: props.classId
});

const spellLevels = ['Природные силы', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const spellSchools = [
  'Воплощение', 'Вызов', 'Иллюзия', 'Некромантия', 
  'Ограждение', 'Очарование', 'Преобразование', 'Прорицание'
];

const startCreatingSpell = () => {
  isCreatingSpell.value = true;
  newSpell.value = {
    name: 'Название',
    school: 'Школа',
    level: 'Природные силы',
    casting_time: 'Время накладывания',
    distance: 'Дистанция',
    duration: 'Длительность',
    verbal: false,
    somatic: false,
    material: false,
    material_description: 'Материальные компоненты',
    description: 'Описание',
    class_id: props.classId
  };
};

const viewSpell = (spell) => {
  selectedSpell.value = spell;
  isViewingSpell.value = true;
};

const startEditingSpell = (spell) => {
  editingSpell.value = JSON.parse(JSON.stringify(spell));
  isEditingSpell.value = true;
  isViewingSpell.value = false;
};

const cancelSpellEdit = () => {
  isEditingSpell.value = false;
  isCreatingSpell.value = false;
  isViewingSpell.value = false;
};
</script>

<template>
  <div class="bg-gray-800 rounded-xl p-6">
    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2 justify-between">
       Особые силы
      <IconButton @click="startCreatingSpell">
        <Plus/>
      </IconButton>
    </h2>

    <SpellForm 
      v-if="isCreatingSpell"
      :spell="newSpell"
      :spellLevels="spellLevels"
      :spellSchools="spellSchools"
      mode="create"
      @cancel="cancelSpellEdit"
      @save="$emit('createSpell', newSpell)"
    />

    <SpellForm 
      v-if="isEditingSpell"
      :spell="editingSpell"
      :spellLevels="spellLevels"
      :spellSchools="spellSchools"
      mode="edit"
      @cancel="cancelSpellEdit"
      @save="$emit('updateSpell', editingSpell)"
    />

    <SpellView 
      v-if="isViewingSpell"
      :spell="selectedSpell"
      @edit="startEditingSpell"
      @delete="$emit('deleteSpell', $event)"
      @close="cancelSpellEdit"
    />

    <SpellList 
      :spells="spells"
      :spellLevels="spellLevels"
      @view="viewSpell"
    />
  </div>
</template>