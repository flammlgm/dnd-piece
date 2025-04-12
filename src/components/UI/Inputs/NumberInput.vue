<script setup>
import IMask from 'imask';

const props = defineProps({
  modelValue: String,
  type: {
    type: [String, Number],
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Boolean,
    default: false,
  },
  autocomplete: {
    type: String,
    default: '',
  },
  mask: {
    type: [String, Object], 
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['update:modelValue']);

const updateValue = (event) => {
  emit('update:modelValue', event.target.value);
};

import {ref, onMounted, watch} from 'vue';

const inputRef = ref(null);

onMounted(() => {
  if (props.mask && inputRef.value) {
    const maskOptions = typeof props.mask === 'string'
        ? {mask: props.mask}
        : props.mask;

    const maskInstance = IMask(inputRef.value, maskOptions);

    maskInstance.on('accept', () => {
      emit('update:modelValue', maskInstance.value);
    });

    watch(() => props.modelValue, (newValue) => {
      if (maskInstance.value !== newValue) {
        maskInstance.value = newValue;
      }
    });
  }
});
</script>

<template>
  <div class="relative group">
    <input
        ref="inputRef"
        :placeholder="placeholder"
        :value="modelValue"
        @input="updateValue"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
        class="block w-full px-2 py-1 rounded-xl transition-all duration-300 outline-none
                  bg-gray-800 focus:bg-gray-900
                  focus:outline-none focus:ring-4 focus:border-transparent text-left
                  border border-gray-700 hover:border-gray-600
                  focus:ring-blue-400/20 text-white placeholder-gray-400"
        :class="error ? 'border-red-500 focus:ring-red-400/40 text-red-500 placeholder-red-400' : ''"
    />
  </div>
</template>

<style scoped>
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>