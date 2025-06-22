<script setup>
import { useAuthStore } from '@/stores/auth';
import Button from ".Button.vue";
import { useRouter } from "vue-router";
import { User } from 'lucide-vue-next';

const router = useRouter();

const navigate = (path) => {
  router.push(path);
};
const authStore = useAuthStore();
</script>

<template>
    <nav class="bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
              <div class=" flex items-baseline space-x-4">
                <router-link to="/" class="text-4xl font-bold font-mono tracking-wide text-white mx-auto md:mx-0 hover:text-gray-400 transition-colors">
                  DnD Piece
                </router-link>
              </div>
          </div>
          <div class="hidden md:block">
            <div class="ml-4 flex items-center md:ml-6">
              <div class="ml-3 relative">
                
                <div class="flex items-center">
                  <nav class="mr-4 space-x-2 font-bold font-mono">
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
                    <button 
                      @click="navigate('/devil-fruits')" 
                      class="text-white hover:text-gray-300 transition-colors py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none">
                      Дьяволские фрукты
                    </button>
                    <button 
                      @click="navigate('/users')" 
                      class="text-white hover:text-gray-300 transition-colors py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none">
                      Игроки
                    </button>
                    <button 
                      @click="navigate('/map')" 
                      class="text-white hover:text-gray-300 transition-colors py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none">
                      Карта
                    </button>
                  </nav>
                  
                  <User class="text-white mx-4 "/>  
                  <span class=" mr-4 font-bold font-mono text-white">{{ authStore.user?.username }}</span>
                  <div class="pl-4 border-l border-gray-500">
                    <Button @click="authStore.logout" text="Выйти" type="danger" size="medium" class="font-bold font-mono"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </template>
  
