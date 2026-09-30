/**
 * API client for communicating with the Flask backend.
 * Automatically injects the Supabase access token into requests.
 */
import { supabase } from './supabase'

const API_BASE = '/api'

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  const headers = { 'Content-Type': 'application/json' }
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
  return headers
}

async function request(endpoint, options = {}) {
  const headers = options.isFormData
    ? { Authorization: (await getAuthHeaders())['Authorization'] }
    : await getAuthHeaders()

  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  }

  // Don't set Content-Type for FormData (browser will set it with boundary)
  if (options.isFormData) {
    delete config.headers['Content-Type']
    delete config.isFormData
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`)
  }

  return data
}

// Auth API
export const authAPI = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getProfile: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/me', { method: 'PUT', body: JSON.stringify(body) }),
}

// Documents API
export const documentsAPI = {
  upload: (formData) => request('/documents/upload', { method: 'POST', body: formData, isFormData: true }),
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/documents${query ? '?' + query : ''}`)
  },
  get: (id) => request(`/documents/${id}`),
  delete: (id) => request(`/documents/${id}`, { method: 'DELETE' }),
}

// Verification API
export const verificationAPI = {
  verify: (docId) => request(`/verify/${docId}`, { method: 'POST' }),
  getStatus: (docId) => request(`/verify/${docId}/status`),
  getHistory: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/verify/history${query ? '?' + query : ''}`)
  },
  getStats: () => request('/verify/stats'),
}

// Dashboard API
export const dashboardAPI = {
  getStats: () => request('/dashboard/stats'),
  getRecent: () => request('/dashboard/recent'),
}
