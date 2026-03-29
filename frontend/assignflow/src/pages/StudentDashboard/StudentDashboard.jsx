import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  User, 
  FileText, 
  BarChart2, 
  FileCheck, 
  LayoutDashboard, 
  LogOut,
  ClipboardList,
  CheckCircle,
  FileSearch
} from 'lucide-react';
import { getStudentAssignments } from '../../api/assignment';
import { getStudentSubmissions } from '../../api/student';
import StatCard from '../../components/ui/StatCard';
import DashboardChart from './components/DashboardChart';
import styles from './StudentDashboard.module.css';

const StudentDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [assignmentsData, submissionsData] = await Promise.all([
        getStudentAssignments(),
        getStudentSubmissions()
      ]);

      setAssignments(assignmentsData);
      setSubmissions(submissionsData);
    } catch (err) {
      if (err.response?.status === 401) {
        // Handled by axios interceptor
      } else if (err.response?.status === 403) {
        setErrorMsg(err.response?.data?.detail || 'Please complete your student profile.');
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

  // Stats calculation
  const stats = {
    totalAssignments: assignments.length,
    totalSubmissions: submissions.length,
    evaluated: submissions.filter(s => s.status?.toLowerCase() === 'reviewed').length,
    pending: assignments.length - submissions.length
  };

  const chartData = {
    totalAssignments: stats.totalAssignments,
    submitted: stats.totalSubmissions,
    evaluated: stats.evaluated
  };

  return (
    <div className={styles.dashboardContainer}>
      <motion.header 
        className={styles.dashboardHeader}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.headerTitleGroup}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
            <LayoutDashboard size={28} color="var(--primary-color)" />
            <h1 className={styles.dashboardTitle}>Student Portal</h1>
          </div>
          <p className={styles.dashboardSubtitle}>Welcome back, <span style={{ color: 'var(--secondary-color)', fontWeight: '700' }}>{user?.email}</span></p>
        </div>
        <button onClick={handleLogout} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LogOut size={18} /> Logout
        </button>
      </motion.header>

      <main className={styles.dashboardMain}>
        {errorMsg && (
          <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444' }}>
            <p style={{ color: '#ef4444', margin: 0 }}>
              <strong>Notice:</strong> {errorMsg}
            </p>
            <Link to="/student-dashboard/profile" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Complete Profile</Link>
          </div>
        )}

        {/* Dynamic Stats Row */}
        <div className={styles.statsGrid}>
          {loading ? (
            <>
              <div className={styles.skeletonCard}></div>
              <div className={styles.skeletonCard}></div>
              <div className={styles.skeletonCard}></div>
            </>
          ) : (
            <>
              <StatCard 
                title="Total Assignments" 
                value={stats.totalAssignments} 
                icon={ClipboardList} 
                color="#1e3a8a" 
                delay={0.1}
                subtitle={`${stats.pending} waiting for submission`}
              />
              <StatCard 
                title="Assignments Submitted" 
                value={stats.totalSubmissions} 
                icon={FileCheck} 
                color="#3b82f6" 
                delay={0.2} 
                subtitle={`${((stats.totalSubmissions/stats.totalAssignments)*100 || 0).toFixed(0)}% Completion rate`}
              />
              <StatCard 
                title="Evaluated" 
                value={stats.evaluated} 
                icon={CheckCircle} 
                color="#10b981" 
                delay={0.3} 
                subtitle={`${stats.totalSubmissions - stats.evaluated} Pending review`}
              />
            </>
          )}
        </div>

        {/* Action Links Grid */}
        <div className={styles.linksGrid}>
          <Link to="/student-dashboard/profile" style={{ textDecoration: 'none' }}>
            <motion.div 
              className={`glass-card hover-lift ${styles.card}`}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className={styles.cardTitle}><User size={22} color="var(--primary-color)" /> My Profile</h3>
              <p className={styles.cardText}>Update your personal details, academic information, and manage your profile identity.</p>
            </motion.div>
          </Link>

          <Link to="/student-dashboard/assignments" style={{ textDecoration: 'none' }}>
            <motion.div 
              className={`glass-card hover-lift ${styles.card}`}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className={styles.cardTitle}><FileText size={22} color="var(--primary-color)" /> Browse Assignments</h3>
              <p className={styles.cardText}>Explore newly published assignments from your faculty and submit your work before deadlines.</p>
            </motion.div>
          </Link>

          <Link to="/student-dashboard/submissions" style={{ textDecoration: 'none' }}>
            <motion.div 
              className={`glass-card hover-lift ${styles.card}`}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className={styles.cardTitle}><FileSearch size={22} color="var(--primary-color)" /> Submission History</h3>
              <p className={styles.cardText}>Track your previously submitted documents and read detailed feedback from your evaluators.</p>
            </motion.div>
          </Link>
        </div>

        {/* Dynamic Chart Section */}
        {!loading && stats.totalAssignments > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <DashboardChart data={chartData} />
          </motion.div>
        )}

        {/* Recent Grades Section */}
        {!loading && submissions.some(s => s.status === 'reviewed') && (
           <div className={`glass-card ${styles.card}`}>
              <h3 className={styles.cardTitle}><BarChart2 size={22} color="var(--primary-color)" /> Recent Performance</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
                {submissions
                  .filter(s => s.status === 'reviewed')
                  .slice(0, 3)
                  .map(sub => (
                    <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
                      <span style={{ fontWeight: '600' }}>{sub.assignment_title}</span>
                      <span style={{ color: 'var(--primary-color)', fontWeight: '800' }}>{sub.marks_obtained} Pts</span>
                    </div>
                  ))
                }
              </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
