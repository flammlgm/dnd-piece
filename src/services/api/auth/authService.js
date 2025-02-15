import api from '../core/httpClient';

export const authService = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    logout: () => api.post('/auth/logout'),
    refreshToken: () => api.get('/auth/refresh'),
    checkAuth: () => api.get('/auth/me'),
};
