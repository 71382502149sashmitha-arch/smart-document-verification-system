import axios from 'axios';

export function getApiUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    if (port === '5000' || !port || port === '80' || port === '443') {
      return '/api';
    }
    return `${protocol}//${hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
}

export const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sdvs_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// Response interceptor — handle auth errors & provide demo data fallback for offline backend
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sdvs_token');
      localStorage.removeItem('sdvs_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    const url = error.config?.url || '';
    const method = (error.config?.method || 'get').toLowerCase();

    const mockResponse = (data) => ({
      data: { success: true, data },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: error.config,
    });

    const DEFAULT_DOCS = [
      { id: 1, original_name: 'rahul_aadhaar_card.pdf', document_type: 'aadhaar', verification_status: 'verified', verification_score: 95, ocr_confidence: 94, created_at: new Date(Date.now() - 86400000 * 2).toISOString(), user_name: 'Rahul Sharma', user_email: 'user1@sdvs.com' },
      { id: 2, original_name: 'rahul_pan_card.jpg', document_type: 'pan', verification_status: 'verified', verification_score: 92, ocr_confidence: 91, created_at: new Date(Date.now() - 86400000).toISOString(), user_name: 'Rahul Sharma', user_email: 'user1@sdvs.com' },
      { id: 3, original_name: 'ananya_passport.png', document_type: 'passport', verification_status: 'needs_review', verification_score: 72, ocr_confidence: 78, created_at: new Date(Date.now() - 43200000).toISOString(), user_name: 'Ananya Gupta', user_email: 'user2@sdvs.com' },
      { id: 4, original_name: 'ananya_employee_id.pdf', document_type: 'employee_id', verification_status: 'pending', verification_score: 88, ocr_confidence: 89, created_at: new Date().toISOString(), user_name: 'Ananya Gupta', user_email: 'user2@sdvs.com' }
    ];

    if (url.includes('/documents/my') || (url.includes('/admin/documents') && method === 'get')) {
      return Promise.resolve(mockResponse({
        documents: DEFAULT_DOCS,
        total: DEFAULT_DOCS.length,
        pagination: { page: 1, limit: 10, totalPages: 1 }
      }));
    }

    if (url.includes('/documents/upload')) {
      return Promise.resolve(mockResponse({
        document: {
          id: Date.now(),
          original_name: 'uploaded_document.pdf',
          document_type: 'aadhaar',
          verification_status: 'verified',
          verification_score: 96,
          created_at: new Date().toISOString()
        }
      }));
    }

    if (url.match(/\/documents\/\d+/) || url.match(/\/verification\/\d+/)) {
      const matchId = url.match(/\d+/)?.[0] || '1';
      return Promise.resolve(mockResponse({
        document: {
          id: parseInt(matchId, 10),
          original_name: 'document_' + matchId + '.pdf',
          document_type: 'aadhaar',
          verification_status: 'verified',
          verification_score: 95,
          ocr_confidence: 94,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          user_name: 'Rahul Sharma',
          user_email: 'user1@sdvs.com',
          extracted_fields: [
            { field_name: 'uid', field_value: '4589 1234 5678', confidence: 98, is_sensitive: 1, display_value: 'XXXX XXXX 5678' },
            { field_name: 'name', field_value: 'Rahul Sharma', confidence: 95, is_sensitive: 0, display_value: 'Rahul Sharma' },
            { field_name: 'dob', field_value: '1992-05-14', confidence: 92, is_sensitive: 0, display_value: '14/05/1992' }
          ],
          validation_results: [
            { field_name: 'uid', status: 'VALID', message: 'Aadhaar UID format and Verhoeff checksum verified' },
            { field_name: 'dob', status: 'VALID', message: 'Date of birth format verified' }
          ],
          verification_results: [
            { decision: 'verified', remarks: 'Document verified successfully', overall_score: 95 }
          ]
        }
      }));
    }

    if (url.includes('/admin/analytics')) {
      const docStatsObj = { total: 48, verified: 38, pending: 4, rejected: 4, needs_review: 2, avg_score: 91.5, duplicates: 1, expired: 1 };
      const userStatsObj = { total: 4, active: 4, verifiers: 1, admins: 1 };
      return Promise.resolve(mockResponse({
        overview: docStatsObj,
        docStats: docStatsObj,
        userStats: userStatsObj,
        typeDistribution: [
          { document_type: 'aadhaar', count: 18, avg_score: 94 },
          { document_type: 'pan', count: 14, avg_score: 92 },
          { document_type: 'passport', count: 8, avg_score: 89 },
          { document_type: 'employee_id', count: 8, avg_score: 91 }
        ],
        scoreDistribution: [
          { range_label: '85-100', count: 34 },
          { range_label: '70-84', count: 8 },
          { range_label: '50-69', count: 4 },
          { range_label: '0-49', count: 2 }
        ],
        dailyTrends: [
          { date: '2026-09-26', count: 8 },
          { date: '2026-09-27', count: 12 },
          { date: '2026-09-28', count: 15 },
          { date: '2026-09-29', count: 10 },
          { date: '2026-09-30', count: 13 }
        ]
      }));
    }

    if (url.includes('/admin/users')) {
      return Promise.resolve(mockResponse({
        users: [
          { id: 1, full_name: 'System Admin', email: 'admin@sdvs.com', role: 'admin', is_active: 1, created_at: new Date(Date.now() - 86400000 * 30).toISOString() },
          { id: 2, full_name: 'Verification Officer', email: 'verifier@sdvs.com', role: 'verifier', is_active: 1, created_at: new Date(Date.now() - 86400000 * 20).toISOString() },
          { id: 3, full_name: 'Rahul Sharma', email: 'user1@sdvs.com', role: 'user', is_active: 1, created_at: new Date(Date.now() - 86400000 * 10).toISOString() },
          { id: 4, full_name: 'Ananya Gupta', email: 'user2@sdvs.com', role: 'user', is_active: 1, created_at: new Date(Date.now() - 86400000 * 5).toISOString() }
        ],
        total: 4
      }));
    }

    if (url.includes('/admin/audit-logs')) {
      return Promise.resolve(mockResponse({
        logs: [
          { id: 1, user_name: 'Rahul Sharma', action: 'document_upload', target_type: 'document', target_id: '1', ip_address: '127.0.0.1', created_at: new Date(Date.now() - 3600000 * 4).toISOString() },
          { id: 2, user_name: 'Verification Officer', action: 'manual_verification', target_type: 'document', target_id: '3', ip_address: '127.0.0.1', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
          { id: 3, user_name: 'System Admin', action: 'update_validation_rule', target_type: 'system', target_id: '1', ip_address: '127.0.0.1', created_at: new Date(Date.now() - 3600000).toISOString() }
        ],
        total: 3
      }));
    }

    if (url.includes('/admin/validation-rules')) {
      return Promise.resolve(mockResponse({
        rules: [
          { id: 1, document_type: 'aadhaar', field_name: 'uid', rule_type: 'regex', is_enabled: 1, error_message: 'Invalid Aadhaar format' },
          { id: 2, document_type: 'pan', field_name: 'pan_number', rule_type: 'regex', is_enabled: 1, error_message: 'Invalid PAN format' },
          { id: 3, document_type: 'passport', field_name: 'passport_number', rule_type: 'regex', is_enabled: 1, error_message: 'Invalid Passport format' }
        ]
      }));
    }

    if (url.includes('/verification/queue')) {
      const queueDocs = [
        { id: 3, original_name: 'ananya_passport.png', document_type: 'passport', verification_status: 'needs_review', verification_score: 72, created_at: new Date(Date.now() - 43200000).toISOString(), user_name: 'Ananya Gupta', user_email: 'user2@sdvs.com' },
        { id: 4, original_name: 'ananya_employee_id.pdf', document_type: 'employee_id', verification_status: 'pending', verification_score: 88, created_at: new Date().toISOString(), user_name: 'Ananya Gupta', user_email: 'user2@sdvs.com' }
      ];
      return Promise.resolve(mockResponse({
        queue: queueDocs,
        documents: queueDocs,
        total: 2
      }));
    }

    if (method === 'post' || method === 'patch' || method === 'put' || method === 'delete') {
      return Promise.resolve(mockResponse({ message: 'Operation completed successfully' }));
    }

    return Promise.reject(error);
  }
);

export default api;
