<script setup>
import Button from "@/components/ui/Button.vue";
</script>

<template>
    <header class="w-full bg-gray-900 text-white py-4 px-6 flex justify-between items-center">
      <!-- Название сайта с ссылкой на главную -->
      <router-link to="/" class="text-4xl font-bold font-mono mx-auto tracking-wide  hover:text-gray-300 transition">
        DnD Piece
      </router-link>
  
      <!-- Кнопка выхода -->
      <Button text="Выйти" type="secondary" />
    </header>
  </template>
