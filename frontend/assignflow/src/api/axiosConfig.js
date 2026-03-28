/*
This module configures a custom axios instance for making API requests in the frontend application. It sets the base URL for the API from environment variables and includes interceptors to handle authentication and error responses. The request interceptor attaches the JWT token from local storage to the Authorization header of each request, while the response interceptor checks for 401 and 403 status codes to automatically log out the user and redirect them to the login page if their session has expired or they are unauthorized. This setup ensures that all API interactions are secure and that users are properly authenticated when accessing protected routes.
*/


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
  // Before sending the request, check if a token exists in local storage and attach it to the Authorization header
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

// Response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized (token expired/invalid), gracefully log the user out
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    // Let individual components handle 403 (Forbidden/Incomplete Profile)
    return Promise.reject(error);
  }
);

export default api;
