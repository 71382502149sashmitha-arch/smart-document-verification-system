import api from './axios';
export const documentsAPI = {
  upload: (formData) => api.post('/documents/upload', formData),
  getMy: (params) => api.get('/documents/my', { params }),
  getById: (id) => api.get(`/documents/${id}`),
  getReport: (id) => api.get(`/documents/${id}/report`, { responseType: 'blob' }),
  getFile: (id) => api.get(`/documents/${id}/file`, { responseType: 'blob' }),
  delete: (id) => api.delete(`/documents/${id}`),
};
