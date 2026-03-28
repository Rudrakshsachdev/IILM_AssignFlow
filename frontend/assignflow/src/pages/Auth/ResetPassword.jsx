import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axiosConfig';
import logo from '../../assets/iilm-logo.png';
import styles from '../../components/AuthForm/AuthForm.module.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        if (!token) {
            setError('Missing or invalid reset token.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, new_password: newPassword });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.detail || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={styles.authContainer}>
                <div className={`${styles.authCard} glass-card`}>
                    <div className={styles.authHeader}>
                        <img src={logo} alt="IILM Logo" className={styles.authLogo} />
                        <h2>Success</h2>
                        <p className={styles.authSubtitle}>
                            Your password has been reset successfully.
                        </p>
                    </div>
                    <div style={{
                        background: '#dcfce7',
                        color: '#166534',
                        padding: '1rem',
                        borderRadius: '10px',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        fontWeight: '500',
                        border: '1px solid #bbf7d0'
                    }}>
                        You can now log in with your new password.
                    </div>
                    <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigate('/login')}>
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.authContainer}>
            <div className={`${styles.authCard} glass-card`}>
                <div className={styles.authHeader}>
                    <img src={logo} alt="IILM Logo" className={styles.authLogo} />
                    <h2>Set New Password</h2>
                    <p className={styles.authSubtitle}>
                        Create a strong new password for your account.
                    </p>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.authForm}>
                    <div className={styles.formGroup}>
                        <label>New Password</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={8}
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
                    </div>

                    <div className={styles.formGroup}>
                        <label>Confirm Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className={`btn-primary ${styles.authSubmit}`} disabled={loading || !token}>
                        {loading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                    {!token && <small style={{ color: '#b91c1c', marginTop: '0.5rem', display: 'block' }}>Warning: No reset token found in URL.</small>}
                </form>

                <p className={styles.authSwitch}>
                    <span className={styles.linkText} onClick={() => navigate('/login')}>Back to Login</span>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
