<script setup>
import Header from "@/components/Header.vue";
import { ref, onMounted } from 'vue';
// import { isAuthenticated } from '@/utils/auth';
// import SimpleAuth from '@/components/SimpleAuth.vue';

// const showAuth = ref(false);

// onMounted(() => {
//   if (!isAuthenticated()) {
//     showAuth.value = true;
//   }
// });
</script>

<template>
  <!-- <SimpleAuth v-if="showAuth" /> -->
  <div class="min-h-screen bg-gray-900" >
    <Header />
    <router-view/>
  </div>
</template>
