<script setup>
defineProps({
  title: String,
  show: {
    type: Boolean,
    required: true
  }
  
});

defineEmits(['close']);
</script>

<template>
    <transition name="modal">
      <div 
        v-if="show" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="$emit('close')"
      >
        <div class="relative max-w-full max-h-full overflow-auto bg-gray-800 rounded-lg shadow-xl">
          <div class="border-b mx-6 border-gray-500">
            <h2 class="my-4 text-2xl  font-bold">{{ title }}</h2>
            <button 
              @click="$emit('close')"
              class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Закрыть"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <slot></slot>
        </div>
      </div>
    </transition>
  </template>
  
  <style scoped>
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }
  
  .modal-content {
    max-height: 90vh;
  }
  </style>