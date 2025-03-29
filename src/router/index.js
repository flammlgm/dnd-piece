import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import Classes from "@/views/Classes/Classes.vue";
import Races from "@/views/Races/Races.vue";
import World from "@/views/World/World.vue";
import Roles from "@/views/Roles/Roles.vue";
import WorldMap from "@/views/WorldMap/WorldMap.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/classes", component: Classes },
  { path: "/races", component: Races },
  { path: "/world", component: World },
  { path: "/roles", component: Roles },
  { path: "/map", component: WorldMap },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;