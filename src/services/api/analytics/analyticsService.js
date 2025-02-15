import api from '../core/httpClient';

export const analyticsService = {
    getStats: () => api.get('/analytics/stats'),
    getRevenue: () => api.get('/analytics/revenue'),
};
