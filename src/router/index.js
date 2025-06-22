import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import Classes from "@/views/Classes/Classes.vue";
import ClassView from "@/views/Classes/ClassView.vue";
import Races from "@/views/Races/Races.vue";
import RaceView from "@/views/Races/RaceView.vue";
import World from "@/views/World/World.vue";
import Roles from "@/views/Roles/Roles.vue";
import RoleView from "@/views/Roles/RoleView.vue";
import WorldMap from "@/views/WorldMap/WorldMap.vue";
import DevilFruitsView from "@/views/Fruits/DevilFruitsView.vue";
import Users from '@/views/Users/Users.vue'
import UserView from "@/views/Users/UserView/UserView.vue";
import CharacterView from '@/views/Users/UserView/CharacterView/CharacterView.vue';



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
    path: '/map',
    name: 'WorldMap',
    component: WorldMap,
    meta: { requiresAuth: true }
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
    path: "/users", 
    component: Users,
    name: "users"  ,
    meta: { requiresAuth: true }

  },
  { 
    path: '/users/:id', 
    component: UserView  ,
    meta: { requiresAuth: true }

  }, 
  { 
    path: '/characters/:id', 
    component: CharacterView  ,
    meta: { requiresAuth: true }

  }, 
  { 
    path: "/devil-fruits", 
    component: DevilFruitsView,
    name: "devil-fruits" ,
    meta: { requiresAuth: true }

  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;