<script setup>
import { ref, onMounted } from 'vue';
import NavBar from '@/components/NavBar.vue';
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();

</script>

<template>
  <div class="min-h-screen bg-gray-900" >
    <NavBar v-if="authStore.user" />
    <router-view/>
  </div>
</template>
