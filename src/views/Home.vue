<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import ImageButton from '@/components/UI/Button/ImageButton.vue';
import VisibilityToggle from '@/components/VisibilityToggle.vue';

const router = useRouter();
const authStore = useAuthStore();

const pages = ref([
  {
    id: 'home-races',
    image: "/image/Races/Humans.jpg",
    text: "Расы",
    objectPosition: "50% 10%",
    path: "/races",
  },
  {
    id: 'home-classes',
    image: "/image/Classes/Bruiser.jpg",
    text: "Классы",
    objectPosition: "50% 20%",
    path: "/classes",
  },
  {
    id: 'home-roles',
    image: "/image/Roles/Shipwright.jpg",
    text: "Роли",
    objectPosition: "50% 20%",
    path: "/roles",
  },
  {
    id: 'home-world',
    image: "/image/World.jpg",
    text: "Мир",
    objectPosition: "90% 10%",
    path: "/world",
  },
  {
    id: 'home-map',
    image: "/image/WorldMap.webp",
    text: "Карта",
    objectPosition: "",
    path: "/map",
  },
  {
    id: 'home-fruits',
    image: "/image/DevilFruit.jpg",
    text: "Дяьвольские фрукты",
    objectPosition: "",
    path: "/fruits",
  },
]);

const navigate = (path) => {
  router.push(path);
};

// Загрузка начальных данных
onMounted(() => {
  // Можно добавить загрузку дополнительных данных при необходимости
});
</script>

<template>
  <div class="home-page">
    <!-- Заголовок -->
    <div class="flex flex-col items-center text-center p-10 space-y-5">
      <h1 class="text-white font-bold text-5xl">Добро пожаловать в D&D по One Piece!</h1>
      <p class="text-white font-bold text-3xl">Настольная ролевая система по мотивам One Piece.</p>
    </div>

    <!-- Кнопки навигации -->
    <div class="container mx-auto p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[200px]">
        <VisibilityToggle
          v-for="button in pages"
          :key="button.id"
          :content-id="button.id"
          content-type="home-button"
        >
          <ImageButton 
            :image="button.image"
            :text="button.text"
            :objectPosition="button.objectPosition"
            @click="navigate(button.path)"
            class="h-full"
          />
        </VisibilityToggle>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  background-color: #111827;
  min-height: 100vh;
}

/* Анимация для плавного появления/исчезновения кнопок */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>