import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1/auth';

const AuthForm = ({ type }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student', school: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const isLogin = type === 'login';

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

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
    <div className="auth-container">
      <div className="auth-card glass-card">
        <h2>{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="fade-in">
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>School</label>
                  <input type="text" name="school" value={formData.school} onChange={handleChange} placeholder="e.g. Engineering" />
                </div>
              </div>
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>
        <p className="auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span className="link-text" onClick={() => navigate(isLogin ? '/signup' : '/login')}>{isLogin ? 'Sign up' : 'Login'}</span>
        </p>
      </div>
    </div>
  );
};
export default AuthForm;
