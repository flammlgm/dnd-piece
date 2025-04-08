import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import Classes from "@/views/Classes/Classes.vue";
import ClassView from "@/views/Classes/ClassView.vue";
import AddClass from "@/views/Classes/components/AddClass.vue"
import EditClass from "@/views/Classes/components/EditClass.vue"
import Races from "@/views/Races/Races.vue";
import World from "@/views/World/World.vue";
import Roles from "@/views/Roles/Roles.vue";
import WorldMap from "@/views/WorldMap/WorldMap.vue";

const routes = [
  { 
    path: "/", 
    component: Home,
    name: "home" 
  },
  { 
    path: '/classes', 
    component: Classes 
  },
  { 
    path: '/classes/:id', 
    component: ClassView 

  }, 
  { 
    path: '/classes/new', 
    component: AddClass

  }, 
  { 
    path: '/classes/edit/:id', 
    component: EditClass
  }, 
  { 
    path: "/races", 
    component: Races,
    name: "races" 

  },
  { 
    path: "/world", 
    component: World,
    name: "world" 

  },
  { 
    path: "/roles", 
    component: Roles,
    name: "roles" 

  },
  { 
    path: "/map", 
    component: WorldMap,
    name: "map"

  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;