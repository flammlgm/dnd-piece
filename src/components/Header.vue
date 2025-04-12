<script setup>
import Button from "@/components/ui/Button/Button.vue";
import { useRouter } from "vue-router";
const router = useRouter();

const navigate = (path) => {
  router.push(path);
};
</script>

<template>
  <header class="w-full bg-gray-900 text-white py-4 px-6 flex flex-col md:flex-row justify-between items-center">
    <!-- Название сайта с ссылкой на главную -->
    <router-link to="/" class="text-4xl font-bold font-mono tracking-wide mx-auto md:mx-0 hover:text-gray-300 transition-colors">
      DnD Piece
    </router-link>
    
    <!-- Кнопка выхода -->
    
    <!-- Навигационное меню -->
    <nav class="mt-4 md:mt-0 bg-gray-800 w-full md:w-auto p-4 flex justify-center space-x-6 rounded-xl">
      <button 
        @click="navigate('/')" 
        class="text-white hover:text-gray-300 transition-colors py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none">
        Главная
      </button>
      <button 
        @click="navigate('/classes')" 
        class="text-white hover:text-gray-300 transition-colors py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none">
        Классы
      </button>
      <button 
        @click="navigate('/races')" 
        class="text-white hover:text-gray-300 transition-colors py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none">
        Расы
      </button>
      <button 
        @click="navigate('/world')" 
        class="text-white hover:text-gray-300 transition-colors py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none">
        Мир
      </button>
      <button 
        @click="navigate('/roles')" 
        class="text-white hover:text-gray-300 transition-colors py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none">
        Роли
      </button>
      <Button text="Выйти" type="secondary" class="mt-4 md:mt-0" />

    </nav>
  </header>
</template>
