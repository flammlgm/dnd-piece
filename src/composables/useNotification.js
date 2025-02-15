import {createApp, defineComponent, h} from 'vue';
import Notification from '@/components/ui/Notification.vue';

export function useNotification() {
    return (message, type = 'info', duration = 5000) => {
        const notificationApp = createApp(defineComponent({
            render() {
                return h(Notification, {message, type, duration});
            }
        }));

        const container = document.createElement('div');
        document.body.appendChild(container);
        notificationApp.mount(container);

        setTimeout(() => {
            notificationApp.unmount();
            document.body.removeChild(container);
        }, duration + 500); // Убираем контейнер через время жизни + небольшой запас
    };
}
