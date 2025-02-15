<script setup>
import { useRouter } from "vue-router";
import ImageButton from "@/components/ui/ImageButton.vue";

const router = useRouter();

const navigate = (path) => {
  router.push(path);
};
</script>

<template>
    <div class="flex flex-col items-center text-center p-10 space-y-5">
      <h1 class="text-white font-bold text-5xl">Добро пожаловать в D&D по One Piece!</h1>
      <p class="text-white font-bold text-3xl">Настольная ролевая система по мотивам One Piece.</p>
    </div>
  <div class="container mx-auto p-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ImageButton 
      image="src\assets\image\Classes\Priest.jpg" 
      text="Классы" 
      objectPosition="top" 
      @click="navigate('/classes')"
      
      />
      <ImageButton 
      image="src\assets\image\Races\Fishmans.jpg" 
      text="Расы" 
      objectPosition="top" 
      @click="navigate('/races')"
      />
      <ImageButton 
      image="src\assets\image\WorldMap.webp" 
      text="Мир" 
      objectPosition="center" 
      @click="navigate('/world')"
      />

    </div>
  </div>
</template>

