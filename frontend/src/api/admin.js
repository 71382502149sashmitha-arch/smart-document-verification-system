import api from './axios';
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, data) => api.patch(`/admin/users/${id}/status`, data),
  updateUserRole: (id, data) => api.patch(`/admin/users/${id}/role`, data),
  getAnalytics: () => api.get('/admin/analytics'),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getAllDocuments: (params) => api.get('/admin/documents', { params }),
  getValidationRules: (params) => api.get('/admin/validation-rules', { params }),
  updateValidationRule: (id, data) => api.patch(`/admin/validation-rules/${id}`, data),
  toggleValidationRule: (id) => api.patch(`/admin/validation-rules/${id}/toggle`),
  getNotifications: (params) => api.get('/admin/notifications', { params }),
  markNotificationRead: (id) => api.patch(`/admin/notifications/${id}/read`),
  markAllNotificationsRead: () => api.patch('/admin/notifications/read-all'),
};
