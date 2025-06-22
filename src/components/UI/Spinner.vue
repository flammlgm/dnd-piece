<script setup>
const props = defineProps({
  size: {
    type: String,
    default: 'medium', // small, medium, large, default
  }
});

const sizeClasses = {
  small: 'w-4 h-4',
  medium: 'w-5 h-5',
  large: 'w-6 h-6',
  huge: 'w-14 h-14',
  default: 'w-[24px] h-[24px]',
};
</script>

<template>
  <svg :class="['animate-spin', sizeClasses[size] || sizeClasses.medium]"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
    <path class="opacity-75" fill="currentColor" 
    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
  </svg>
</template>


<style scoped>

</style>