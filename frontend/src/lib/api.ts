import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Auth APIs
export const auth = {
  login: (data: { phone: string; password: string }) => 
    api.post('/api/users/login', data),
  
  register: (data: { name: string; phone: string; password: string; password_confirmation: string }) => 
    api.post('/api/users/register', data),
  
  logout: () => 
    api.post('/api/logout'),
  
  check: () => 
    api.get('/api/users/check'),
  
  forgotPassword: (data: { phone: string }) => 
    api.post('/api/forgot-password', data),
  
  resetPassword: (data: { token: string; phone: string; password: string; password_confirmation: string }) => 
    api.post('/api/reset-password', data),
  
  verifyphone: (id: string, hash: string) => 
    api.get(`/api/verify-phone/${id}/${hash}`),
  
  resendVerification: () => 
    api.post('/api/phone/verification-notification')
}

// Posts APIs
export const posts = {
  getAll: async () => {
    const res = await api.get('/api/posts');
    console.log('Articles API response:', res.data);
    return res;
  },
  
  getOne: (id: string) => 
    api.get(`/api/posts/${id}`),
  
  update: (id: string, data: any) => 
    api.put(`/api/posts/${id}`, data),
  
  create: async (data: any) => {
    if (data instanceof FormData) {
      // Use fetch for FormData to ensure file upload works
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`, {
        method: 'POST',
        credentials: 'include',
        body: data,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'خطا در ایجاد مقاله');
      }
      return response.json();
    } else {
      return api.post('/api/posts', data, {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },
  
  delete: (id: string) =>
    api.delete(`/api/posts/${id}`)
}

// Comments APIs
export const comments = {
  create: (data: any) => 
    api.post('/api/comments' ,data),
  getAll: () => 
    api.get('/api/comments'),
  
  getOne: (id: string) => 
    api.get(`/api/comments/${id}`),
  
  update: (id: string, data: any) => 
    api.put(`/api/comments/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/api/comments/${id}`),

  changeStatus: (id: string, status: string) =>
    api.post(`/api/comments/${id}/status`, { status })
}

// Courses APIs
export const courses = {
  getAll: () => 
    api.get('/api/courses'),
  
  getOne: (id: string) => 
    api.get(`/api/courses/${id}`),
  
  update: (id: string, data: any) => 
    api.put(`/api/courses/${id}`, data),
  
  create: (data: any) => 
    api.post('/api/courses', data),

  delete: (id: string) =>
    api.delete(`/api/courses/${id}`)
}

// Videos APIs
export const videos = {
  getAll: () => 
    api.get('/api/videos'),
  
  getOne: (id: string) => 
    api.get(`/api/videos/${id}`),
  
  update: (id: string, data: any) => 
    api.put(`/api/videos/${id}`, data),
  
  create: (data: any) => 
    api.post('/api/videos', data),
  
  delete: (id: number) => 
    api.delete(`/api/videos/${id}`)
}

// Users APIs
export const users = {
  getAll: () => 
    api.get('/api/users'),
  
  getOne: (id: string) => 
    api.get(`/api/users/${id}`),
  
  update: (id: string, data: any) => 
    api.put(`/api/users/${id}`, data),

  delete: (id: string) => 
    api.delete(`/api/users/${id}`)
}

// Likes API
export const likes = {
  toggle: (data: { likeable_id: number; likeable_type: string }) => 
    api.post('/api/like', data)
}

export const managementTools = {
  getAll: () => api.get('/api/tools'),
  getOne: (id: string) => api.get(`/api/tools/${id}`),
  create: (data: any) => api.post('/api/tools', data),
  update: (id: string, data: any) => api.put(`/api/tools/${id}`, data),
  delete: (id: string) => api.delete(`/api/tools/${id}`),
}

// Consultations APIs
export const consultations = {
  getAll: () => 
    api.get('/api/consultations'),
  
  getOne: (id: number) => 
    api.get(`/api/consultations/${id}`),
  
  create: (data: any) => 
    api.post('/api/consultations', data),
  
  update: (id: number, data: any) => 
    api.put(`/api/consultations/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/api/consultations/${id}`)
}

// Consultation Reservations APIs
export const consultationReservations = {
  getAll: () => 
    api.get('/api/reservations'),
  
  getOne: (id: number) => 
    api.get(`/api/reservations/${id}`),
  
  create: (data: any) => 
    api.post('/api/reservations', data),
  
  update: (id: number, data: any) => 
    api.put(`/api/reservations/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/api/reservations/${id}`),

  updateStatus: (id: number, status: string) =>
    api.put(`/api/reservations/${id}/update-status`, { status })
}

// Add request interceptor for CSRF token
api.interceptors.request.use(async (config) => {
  // Check if we're in the browser environment
  if (typeof window !== 'undefined') {
    // Get CSRF token from cookie
    const csrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1]
    
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken)
    }
  }
  
  return config
})

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Handle unauthorized access
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api