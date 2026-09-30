import api from './axios';
export const verificationAPI = {
  getQueue: (params) => api.get('/verification/queue', { params }),
  getById: (id) => api.get(`/verification/${id}`),
  submitDecision: (id, data) => api.post(`/verification/${id}/decision`, data),
  getHistory: async (params) => {
    const res = await api.get('/documents/my', { params });
    return res.data?.data || { history: [] };
  },
};
