import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import styles from './StudentDashboard.module.css';

const StudentDashboard = () => {
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
          <h1 className={styles.dashboardTitle}>Student Portal</h1>
          <p className={styles.dashboardSubtitle}>Welcome back, {user?.email}</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary">Logout</button>
      </header>

      <main className={styles.dashboardMain}>
        <Link to="/student-dashboard/profile" style={{ textDecoration: 'none' }}>
          <div className={`glass-card hover-lift ${styles.card}`}>
            <h3>👤 My Profile</h3>
            <p className="text-muted">View and manage your student profile, upload your photo, and update your details.</p>
          </div>
        </Link>

        <div className={`glass-card ${styles.card}`}>
          <h3>📝 My Assignments</h3>
          <p className="text-muted">You have no pending assignments at the moment. Enjoy your free time!</p>
          <div className="skeleton-line" style={{marginTop: '2rem'}}></div>
          <div className="skeleton-line short"></div>
        </div>

        <div className={`glass-card ${styles.card}`}>
          <h3>📊 Recent Grades</h3>
          <p className="text-muted">No recent grades posted.</p>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;

