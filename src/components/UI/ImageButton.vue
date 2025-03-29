<script setup>
const props = defineProps({
  image: String, // Ссылка на изображение
  text: String, // Текст кнопки
  objectPosition: {
    type: String,
    default: "center", // Позиция картинки
  },
  scale: {
    type: Number,
    default: 1.1, // Коэффициент масштабирования при наведении
  },
});
</script>

<template>
  <button
    class="relative w-full h-32 sm:h-40 md:h-48 lg:h-56 xl:h-64 rounded-3xl overflow-hidden group focus:outline-none"
  >
    <img
      :src="image"
      alt="Button Image"
      class="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110"
      :style="{ objectPosition }"
    />
    <div
      class="absolute inset-0 bg-black bg-opacity-50 group-hover:bg-opacity-30 transition-opacity"
    ></div>
    <span
      class="absolute font-mono font-bold inset-0 flex items-center justify-center text-white text-lg sm:text-xl md:text-2xl lg:text-5xl"
    >
      {{ text }}
    </span>
  </button>
</template>
