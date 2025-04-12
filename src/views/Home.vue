<script setup>
import { useRouter } from "vue-router";
import ImageButton from "@/components/ui/ImageButton.vue";

const router = useRouter();

const navigate = (path) => {
  router.push(path);
};

const pages = [
{
    image: "/image/Races/Humans.jpg",
    text: "Расы",
    objectPosition: "50% 10%",
    path: "/races",
  },
  {
    image: "/image/Classes/Bruiser.jpg",
    text: "Классы",
    objectPosition: "50% 20%",
    path: "/classes",
  },
  {
    image: "/image/Roles/Плотник.jpg",
    text: "Роли",
    objectPosition: "50% 20%",
    path: "/roles",
  },
  {
    image: "/image/World.jpg",
    text: "Мир",
    objectPosition: "90% 10%",
    path: "/world",
  },
  {
    image: "/image/WorldMap.webp",
    text: "Карта",
    objectPosition: "",
    path: "/map",
  },
]
</script>

<template>
    <div class="flex flex-col items-center text-center p-10 space-y-5">
      <h1 class="text-white font-bold text-5xl">Добро пожаловать в D&D по One Piece!</h1>
      <p class="text-white font-bold text-3xl">Настольная ролевая система по мотивам One Piece.</p>
    </div>
    <div class="container mx-auto p-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ImageButton 
        v-for="button in pages"
        :key="button.text"
        :image="button.image"
        :text="button.text"
        :objectPosition="button.objectPosition"
        @click="navigate(button.path)"
      />
    </div>
  </div>
</template>

