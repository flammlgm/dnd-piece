import api from '../core/httpClient';

export const userService = {
    getProfile: () => api.get('/user/profile'),
    updateProfile: (data) => api.put('/user/update', data),
};
