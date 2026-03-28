import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { User, FileText, BarChart2 } from 'lucide-react';
import { getStudentAssignments } from '../../api/assignment';
import { getMySubmissions } from '../../api/submission';
import styles from './StudentDashboard.module.css';

const StudentDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [assignmentsData, submissionsData] = await Promise.all([
        getStudentAssignments(),
        getMySubmissions()
      ]);

      // Merge submission status into assignments
      const merged = assignmentsData.map(assignment => {
        const submission = submissionsData.find(sub => sub.assignment_id === assignment.id);
        return {
          ...assignment,
          submissionStatus: submission ? submission.status : 'Pending'
        };
      });

      setAssignments(merged);
    } catch (err) {
      if (err.response?.status === 401) {
        // Auth interceptor handles this
      } else if (err.response?.status === 403) {
        setErrorMsg(err.response?.data?.detail || 'Please complete your student profile to view assignments.');
      } else {
        setErrorMsg('Failed to load dashboard data.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
        {errorMsg && (
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid #ef4444' }}>
            <p style={{ color: '#ef4444', margin: 0 }}>
              <strong>Notice:</strong> {errorMsg}
            </p>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <Link to="/student-dashboard/profile" style={{ textDecoration: 'none' }}>
            <div className={`glass-card hover-lift ${styles.card}`} style={{ height: '100%' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={20} color="var(--primary-color)" /> My Profile</h3>
              <p className="text-muted">View and manage your student profile, upload your photo, and update your details.</p>
            </div>
          </Link>
          <Link to="/student-dashboard/assignments" style={{ textDecoration: 'none' }}>
            <div className={`glass-card hover-lift ${styles.card}`} style={{ height: '100%' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={20} color="var(--primary-color)" /> My Assignments</h3>
              {loading ? (
                <div>
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line short" style={{ marginTop: '0.5rem' }}></div>
                </div>
              ) : (
                <>
                  <p className="text-muted">Total Assignments: {assignments.length}</p>
                  <p className="text-muted" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Pending: {assignments.filter(a => a.submissionStatus === 'Pending').length}</p>
                </>
              )}
            </div>
          </Link>
          <div className={`glass-card ${styles.card}`}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BarChart2 size={20} color="var(--primary-color)" /> Recent Grades</h3>
            <p className="text-muted">No recent grades posted.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;

