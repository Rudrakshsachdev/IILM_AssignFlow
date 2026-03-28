import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Retrieve the base API URL from Vite environment variables or fallback
// IMPORTANT: VITE_API_URL should be the base without /auth (e.g. http://localhost:8000/api/v1)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Create a custom axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401/403 errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // If unauthorized, gracefully log the user out
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
