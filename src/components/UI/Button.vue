<script setup>
defineProps({
  text: String, // Текст кнопки
  type: {
    type: String,
    default: "primary", // primary | secondary | danger
  },
});
</script>

<template>
  <button
    class="px-4 py-2 rounded-md text-lg font-semibold transition-all duration-200 focus:outline-none"
    :class="{
      'bg-blue-600 text-white hover:bg-blue-700': type === 'primary',
      'bg-gray-600 text-white hover:bg-gray-700': type === 'secondary',
      'bg-red-600 text-white hover:bg-red-700': type === 'danger',
    }"
  >
    {{ text }}
  </button>
</template>
