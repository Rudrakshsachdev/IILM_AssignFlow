import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null, // Will hold user info
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  
  setAuth: (token) => {
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: true });
  },
  
  setUser: (user) => {
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
