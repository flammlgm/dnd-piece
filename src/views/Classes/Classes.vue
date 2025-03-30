<script setup>
import { useRouter } from "vue-router";
import ImageButton from "@/components/ui/ImageButton.vue";
import { useClassesStore } from "../../stores/classesStore";

const router = useRouter();

const classes = useClassesStore

const navigate = (path) => {
  router.push(path);
};
</script>

<template>
  
  <div class="container mx-auto p-4">
    <h1 class="text-white font-bold text-5xl m-10">Классы</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ImageButton 
        v-for="cls in classes"
        :key="cls.id"
        :image="cls.image"
        :text="cls.text"
        :objectPosition="cls.objectPosition"
         @click="navigate(`/classes/${cls.id}`)"
      />
    </div>
  </div>
</template>

