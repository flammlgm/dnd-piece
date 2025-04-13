<script setup>
import IconButton from '@/components/UI/Button/IconButton.vue';
import { Pen, Trash } from 'lucide-vue-next';

defineProps({
  classData: Object
});

defineEmits(['edit']);
</script>

<template>
  <div class="flex justify-between items-start mb-6">
    <h1 class="text-4xl lg:text-5xl font-bold">{{ classData.name }}</h1>
    <div class="flex gap-2">
      <IconButton @click="$emit('edit')" title="Изменить класс">
        <Pen class="w-4 h-4"/>
      </IconButton>
    </div>
  </div>
</template>