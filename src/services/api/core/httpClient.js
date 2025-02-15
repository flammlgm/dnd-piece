import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true, // Передаём httpOnly JWT
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Перехватчик ошибок
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Ошибка API:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
