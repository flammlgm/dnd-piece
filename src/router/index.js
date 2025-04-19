import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import Classes from "@/views/Classes/Classes.vue";
import ClassView from "@/views/Classes/ClassView.vue";
import Races from "@/views/Races/Races.vue";
import RaceView from "@/views/Races/RaceView.vue";
import World from "@/views/World/World.vue";
import Fruits from "@/views/Fruits/Fruits.vue";
import Roles from "@/views/Roles/Roles.vue";
import RoleView from "@/views/Roles/RoleView.vue";
import WorldMap from "@/views/WorldMap/WorldMap.vue";
// import { isAuthenticated } from '@/utils/auth';



const routes = [
    {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  { 
    path: '/classes', 
    component: Classes ,
    meta: { requiresAuth: true }

  },
  { 
    path: '/classes/:id', 
    component: ClassView  ,
    meta: { requiresAuth: true }

  }, 
  { 
    path: "/races", 
    component: Races,
    name: "races"  ,
    meta: { requiresAuth: true }

  },
  { 
    path: '/races/:id', 
    component: RaceView  ,
    meta: { requiresAuth: true }

  }, 
  { 
    path: "/world", 
    component: World,
    name: "world"  ,
    meta: { requiresAuth: true }

  },
  { 
    path: "/roles", 
    component: Roles,
    name: "roles"  ,
    meta: { requiresAuth: true }

  },
  { 
    path: '/roles/:id', 
    component: RoleView  ,
    meta: { requiresAuth: true }

  }, 
  { 
    path: "/fruits", 
    component: Fruits,
    name: "fruits" ,
    meta: { requiresAuth: true }

  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;