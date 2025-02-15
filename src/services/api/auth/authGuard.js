import { useAuthStore } from '@/stores/authStore';

export function requireAuth(to, from, next) {
    const authStore = useAuthStore();

    // Запрещаем заходить на /login, если уже авторизован
    if (authStore.isAuthenticated && to.path === '/login') {
        return next('/');
    }

    // Если маршрут требует авторизации и пользователь не авторизован — отправляем на /login
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return next('/login');
    }

    // Иначе продолжаем переход
    return next();
}