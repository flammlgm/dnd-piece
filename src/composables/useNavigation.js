import {computed} from 'vue';
import {BarChart2, LayoutDashboard, Settings, Users} from "lucide-vue-next";

export function useNavigation(userRole) {
    const menuItems = computed(() => {
        const baseRoutes = [
            {path: "/", label: "Дашборд", icon: LayoutDashboard, roles: ["admin", "user"]},
            {path: "/analytics", label: "Аналитика", icon: BarChart2, roles: ["admin"]},
            {path: "/employees", label: "Сотрудники", icon: Users, roles: ["admin"]},
            {path: "/settings", label: "Настройки", icon: Settings, roles: ["admin", "user"]},
        ];

        // ✅ Фильтруем меню в зависимости от роли
        return baseRoutes.filter(route => route.roles.includes(userRole));
    });

    return {menuItems};
}
