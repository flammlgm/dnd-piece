<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useClassesStore } from '@/stores/classesStore';  // Импортируем store

const route = useRoute();
const classId = parseInt(route.params.id);
const store = useClassesStore();

// Получаем текущий класс по ID
const currentClass = computed(() => store.findClassById(classId));

const activeTab = ref('description');
</script>

<template>
<div>{{currentClass.name}}</div>
</template>
