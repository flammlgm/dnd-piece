<script setup>
import { ref } from 'vue';
import SubclassView from './components/SubclassView.vue';
import SubclassEditForm from './components/SubclassEditForm.vue';

const props = defineProps({
  subclasses: Array,
  activeTab: String
});

const emit = defineEmits(['editSubclass', 'saveSubclass', 'cancelEditSubclass', 'deleteSubclass']);

const isEditingSubclass = ref(false);
const editSubclassData = ref(null);

const editSubclass = (subclass) => {
  editSubclassData.value = JSON.parse(JSON.stringify(subclass));
  isEditingSubclass.value = true;
};

const saveSubclass = async (data) => {
  emit('saveSubclass', data);
  isEditingSubclass.value = false;
};

const cancelEditSubclass = () => {
  isEditingSubclass.value = false;
  editSubclassData.value = null;
};
</script>

<template>
  <div>
    <div 
      v-for="subclass in subclasses" 
      v-show="activeTab === `subclass-${subclass.id}`"
      :key="subclass.id"
      class="bg-gray-800 rounded-xl p-6 mb-6"
    >
      <SubclassEditForm 
        v-if="isEditingSubclass && editSubclassData?.id === subclass.id"
        :subclass="editSubclassData"
        @save="saveSubclass"
        @cancel="cancelEditSubclass"
      />
      
      <SubclassView 
        v-else
        :subclass="subclass"
        @edit="editSubclass"
        @delete="$emit('deleteSubclass', $event)"
      />
    </div>
  </div>
</template>