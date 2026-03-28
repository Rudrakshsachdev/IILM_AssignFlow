/*
This component defines an authentication form for both login and signup functionalities in a React application. It uses Zustand for state management and Axios for API requests. The form includes fields for name, email, password, role, and school (for signup), with validation and error handling. The password field has a toggle to show or hide the password. Upon successful login, the user is redirected to their respective dashboard based on their role. The component also provides a link to switch between login and signup forms.
*/

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../api/axiosConfig';
import logo from '../../assets/iilm-logo.png';
import styles from './AuthForm.module.css';

const AuthForm = ({ type }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student', school: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);
  const user = useAuthStore(state => state.user);

  const isLogin = type === 'login';

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // We use the custom api instance, avoiding manual url manipulation unless needed
        const res = await api.post('/auth/login', { email: formData.email, password: formData.password });
        
        // This will now internally decode the JWT inside Zustand
        setAuth(res.data.access_token);
        
        // We need to wait for state to update or just fetch it direct from Zustand, but we can also just use a microtask or redirect based on the updated store when it re-renders. A pure way is getting state post-set:
        const updatedState = useAuthStore.getState();
        if (updatedState.user?.role) {
           navigate(`/${updatedState.user.role}-dashboard`);
        } else {
           navigate('/');
        }
      } else {
        await api.post('/auth/signup', formData);
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className={styles.authContainer}>
      <div className={`${styles.authCard} glass-card`}>
        <div className={styles.authHeader}>
          <img src={logo} alt="IILM Logo" className={styles.authLogo} />

          <h2>{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
          <p className={styles.authSubtitle}>
            {isLogin ? 'Please enter your details to sign in.' : 'Enter your details to register.'}
          </p>
        </div>
        {error && <div className={styles.errorMessage}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.authForm}>
          {!isLogin && (
            <div className="fade-in">
              <div className={styles.formGroup}>
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Role</label>
                  <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>School</label>
                  <input type="text" name="school" value={formData.school} onChange={handleChange} placeholder="e.g. SRM / IILM" />
                </div>
              </div>
            </div>
          )}
          <div className={styles.formGroup}>
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="name@email.com" />
          </div>
          <div className={styles.formGroup}>
            <label>Password</label>
            <div className={styles.passwordWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
              <button 
                type="button" 
                className={styles.passwordToggle} 
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {isLogin && (
              <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                <span 
                  className={styles.linkText} 
                  style={{ fontSize: '0.85rem', fontWeight: 500 }}
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot Password?
                </span>
              </div>
            )}
          </div>
          <button type="submit" className={`btn-primary ${styles.authSubmit}`} disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>
        <p className={styles.authSwitch}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span className={styles.linkText} onClick={() => navigate(isLogin ? '/signup' : '/login')}>{isLogin ? 'Sign up' : 'Login'}</span>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;

