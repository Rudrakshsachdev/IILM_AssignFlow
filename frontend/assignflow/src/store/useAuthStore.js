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

let logoutTimer = null;

const startLogoutTimer = (token, logout) => {
  if (logoutTimer) clearTimeout(logoutTimer);
  try {
    const decoded = jwtDecode(token);
    const expirationTime = decoded.exp * 1000;
    const remainingTime = expirationTime - Date.now();
    
    if (remainingTime > 0) {
      logoutTimer = setTimeout(() => {
        console.warn("Session expired. Logging out...");
        logout();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }, remainingTime);
    } else {
      logout();
    }
  } catch (error) {
    logout();
  }
};

export const useAuthStore = create((set, get) => ({
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
    startLogoutTimer(token, get().logout);
  },
  
  setUser: (user) => {
    set({ user });
  },

  logout: () => {
    if (logoutTimer) clearTimeout(logoutTimer);
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));

// Initialize timer if token is already present and valid
if (initialIsValid && initialToken) {
  startLogoutTimer(initialToken, useAuthStore.getState().logout);
}

