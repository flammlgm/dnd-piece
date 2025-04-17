import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './router';
import './assets/tailwind.css';

const app = createApp(App);
const pinia = createPinia();

// Порядок важен: сначала Pinia, потом Router
app.use(pinia);
app.use(router);

// Добавляем навигационную защиту после создания приложения
import { useAuthStore } from '@/stores/auth';

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = await authStore.checkAuth();

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

app.mount('#app');