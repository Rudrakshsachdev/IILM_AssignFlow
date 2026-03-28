import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import axios from 'axios';
import styles from './AuthForm.module.css';

const API_URL = 'http://localhost:8000/api/v1/auth';

const AuthForm = ({ type }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student', school: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const isLogin = type === 'login';

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await axios.post(`${API_URL}/login`, { email: formData.email, password: formData.password });
        setAuth(res.data.access_token);
        navigate('/dashboard');
      } else {
        await axios.post(`${API_URL}/signup`, formData);
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
        <h2>{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
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
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
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

