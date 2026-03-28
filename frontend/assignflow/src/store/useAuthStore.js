import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

// Helper to check token validity
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    // Token expr is in Unix seconds string format
    if (decoded.exp * 1000 < Date.now()) {
      return false; // Expired
    }
    return true;
  } catch (error) {
    return false; // Invalid token
  }
};

// Retrieve token early
const initialToken = localStorage.getItem('token');
const initialIsValid = isTokenValid(initialToken);
let initialUser = null;

if (initialIsValid && initialToken) {
  try {
    const decoded = jwtDecode(initialToken);
    initialUser = { email: decoded.sub, role: decoded.role };
  } catch(e) {}
}

export const useAuthStore = create((set) => ({
  user: initialUser,
  token: initialIsValid ? initialToken : null,
  isAuthenticated: initialIsValid,
  
  setAuth: (token) => {
    localStorage.setItem('token', token);
    
    let decodedUser = null;
    try {
        const decoded = jwtDecode(token);
        decodedUser = { email: decoded.sub, role: decoded.role };
    } catch(e) {
        console.error("Failed to decode token", e);
    }
    
    set({ token, isAuthenticated: true, user: decodedUser });
  },
  
  setUser: (user) => {
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));

