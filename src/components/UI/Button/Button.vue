<script setup>
defineProps({
  text: String, // Текст кнопки
  type: {
    type: String,
    default: "primary", // primary | secondary | danger
  },
  size: String
});
</script>

<template>
  <button
    class="px-4 py-2 rounded-md font-semibold transition-all duration-200 focus:outline-none "
    :class="{
      
      'text-white bg-gray-800 border border-gray-600 hover:border-blue-700': type === 'primary',
      'text-white bg-gray-800 border border-gray-600 hover:border-gray-700': type === 'secondary',
      'text-white bg-gray-800 border border-gray-600 hover:border-red-700': type === 'danger',
      'text-sm': size === 'small',
      'text-md': size === 'medium',
      'text-lg': size === 'large',
    }"
  >
    {{ text }}
  </button>
</template>
