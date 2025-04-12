<script setup>
import IMask from 'imask';

const props = defineProps({
  modelValue:[String, Number],
  type: {
    type: [String, Number],
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  icon: {
    type: [Object, Function],
    required: true,
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
    type: [String, Object], // Поддержка строки или объекта для маски
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
    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
         :class="error ? 'text-red-500' : 'text-gray-400'">
      <component :is="icon" class="h-5 w-5"/>
    </div>
    <input
        ref="inputRef"
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        @input="updateValue"
        :required="required"
        :name="type"
        :autocomplete="autocomplete"
        :disabled="disabled"
        class="block w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-300 outline-none
                  bg-gray-800 focus:bg-gray-900
                  focus:outline-none focus:ring-4 ffocus:border-transparent"
      

    />
  </div>
</template>