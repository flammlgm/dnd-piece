<script setup>
import {computed} from "vue";

const props = defineProps({
  size: {
    type: String,
    default: "medium",
  },
  disabled: {
    type: Boolean,
    default: false,
  }
});

const sizes = {
  small: 'p-1',
  medium: 'p-2.5',
  large: 'p-4.5'
};

const sizeClasses = computed(() => sizes[props.size]);

const disabledClasses = computed(() =>
    props.disabled ? 'opacity-60 pointer-events-none' : ''
);
</script>

<template>
  <button
      class="rounded-lg bg-gray-800 border border-gray-600 hover:border-blue-600
           inline-flex items-center justify-center
    [transform-origin:center] will-change-transform
    [backface-visibility:hidden]
    active:scale-[0.97] transition-transform duration-200 active:bg-blue-200 dark:active:bg-blue-900/50"
      :class="[sizeClasses, disabledClasses]"
      :disabled="disabled"
  >
  <slot/>

  </button>
</template>