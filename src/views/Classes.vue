<script setup>
import { useRouter } from "vue-router";
import ImageButton from "@/components/ui/ImageButton.vue";

const router = useRouter();

const navigate = (path) => {
  router.push(path);
};
</script>

<template>
      <h1 class="text-white font-bold text-5xl m-10">Классы</h1>
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

