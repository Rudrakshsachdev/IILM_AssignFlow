import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import styles from '../StudentDashboard/StudentDashboard.module.css'; // Reusing CSS

const FacultyDashboard = () => {
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
          <h1 className={styles.dashboardTitle}>Faculty Portal</h1>
          <p className={styles.dashboardSubtitle}>Welcome back, Instructor {user?.email}</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary">Logout</button>
      </header>

      <main className={styles.dashboardMain}>
        <div className={`glass-card ${styles.card}`}>
          <h3>Manage Assignments</h3>
          <p className="text-muted">You have 3 active assignments ready for grading.</p>
          <button className="btn-primary" style={{marginTop: '1rem'}}>Grade Now</button>
        </div>

        <div className={`glass-card ${styles.card}`}>
          <h3>Class Performance</h3>
          <p className="text-muted">Analytics for your assigned sections are updated weekly.</p>
          <div className="progress-bar" style={{marginTop: '2rem'}}>
             <div className="progress-fill" style={{width: '65%'}}></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FacultyDashboard;
