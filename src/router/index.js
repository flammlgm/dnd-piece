import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import Classes from '@/views/Classes.vue';
import Races from '@/views/Races.vue';
import Rules from '@/views/Rules.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/classes', component: Classes },
  { path: '/races', component: Races },
  { path: '/rules', component: Rules },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
