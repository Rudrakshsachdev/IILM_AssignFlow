import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { logout } = useAuthStore();

  return (
    <div className={`${styles.dashboardContainer} fade-in`}>
      <header className={`${styles.dashboardHeader} glass-card`}>
        <h1>Dashboard</h1>
        <p>Welcome to your academic hub.</p>
      </header>
      <div className={styles.dashboardGrid}>
        <div className={`glass-card ${styles.dashboardCard} hover-lift`}>
          <h3>Your Assignments</h3>
          <p className="text-muted">No new assignments yet.</p>
        </div>
        <div className={`glass-card ${styles.dashboardCard} hover-lift`}>
          <h3>Recent Activity</h3>
          <p className="text-muted">You logged in successfully.</p>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;

