<script setup>
import ClassStats from './components/ClassStats.vue';
import ClassTable from './components/ClassTable.vue';
import ClassProficiencies from './components/ClassProficiencies.vue';
import ClassSkills from './components/ClassSkills.vue';

defineProps({
  classData: Object
});
</script>

<template>
  <div>
    <ClassStats :classData="classData" />
    <ClassTable :features="classData.features" />
    <ClassProficiencies :proficiencies="classData.proficiencies" />
    <ClassSkills :features="classData.features" />
  </div>
</template>