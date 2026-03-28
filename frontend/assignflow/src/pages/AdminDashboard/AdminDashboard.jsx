import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import styles from '../StudentDashboard/StudentDashboard.module.css';

const AdminDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.dashboardTitle}>System Admin</h1>
          <p className={styles.dashboardSubtitle}>Logged in as {user?.email} (Administrator)</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary">Logout</button>
      </header>

      <main className={styles.dashboardMain}>
        <div className={`glass-card ${styles.card}`}>
          <h3>Manage Users</h3>
          <p className="text-muted">Review, approve, or remove user accounts.</p>
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>

        <div className={`glass-card ${styles.card}`}>
          <h3>System Settings</h3>
          <p className="text-muted">Configure platforms settings, semesters, and notifications.</p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
