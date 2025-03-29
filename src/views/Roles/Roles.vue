<script setup>
import { useRouter } from "vue-router";
import ImageButton from "@/components/ui/ImageButton.vue";
import { useRolesStore } from "../../stores/rolesStore";

const router = useRouter();

const roles = useRolesStore

const navigate = (path) => {
  router.push(path);
};
</script>

<template>
  
  <div class="container mx-auto p-4">
    <h1 class="text-white font-bold text-5xl m-10">Роли</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ImageButton 
        v-for="button in roles"
        :key="button.text"
        :image="button.image"
        :text="button.text"
        :objectPosition="button.objectPosition"
        @click="navigate(button.path)"
        
      />
    </div>
  </div>
</template>

