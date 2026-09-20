import axios from 'axios';

// Create base Axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT Bearer token if available in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor for handling 401s and format errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if session expired (unless already on auth page)
      const isAuthPage = window.location.pathname.includes('/login') || window.location.pathname.includes('/register');
      if (!isAuthPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
