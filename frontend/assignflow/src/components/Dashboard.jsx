import React from 'react';
import { useAuthStore } from '../store/useAuthStore';

const Dashboard = () => {
  const { logout } = useAuthStore();

  return (
    <div className="dashboard-container fade-in">
      <header className="dashboard-header glass-card">
        <h1>Dashboard</h1>
        <p>Welcome to your academic hub.</p>
      </header>
      <div className="dashboard-grid">
        <div className="glass-card dashboard-card hover-lift">
          <h3>Your Assignments</h3>
          <p className="text-muted">No new assignments yet.</p>
        </div>
        <div className="glass-card dashboard-card hover-lift">
          <h3>Recent Activity</h3>
          <p className="text-muted">You logged in successfully.</p>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
