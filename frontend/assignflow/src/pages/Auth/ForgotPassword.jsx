import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import logo from '../../assets/iilm-logo.png';
import styles from '../../components/AuthForm/AuthForm.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message || 'If that email is registered, a reset link will be sent.');
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
          <h2>Reset Password</h2>
          <p className={styles.authSubtitle}>
            Enter your email address to receive a password reset link.
          </p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {message && <div style={{ 
          background: '#dcfce7', 
          color: '#166534', 
          padding: '1rem', 
          borderRadius: '10px', 
          marginBottom: '1.5rem', 
          fontSize: '0.9rem', 
          textAlign: 'center', 
          fontWeight: '500', 
          border: '1px solid #bbf7d0' 
        }}>{message}</div>}

        {!message && (
          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className={styles.formGroup}>
              <label>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="name@email.com" 
              />
            </div>
            <button type="submit" className={`btn-primary ${styles.authSubmit}`} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className={styles.authSwitch}>
          Remembered your password?
          <span className={styles.linkText} onClick={() => navigate('/login')}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
