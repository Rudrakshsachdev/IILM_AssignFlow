import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  Plus, 
  ClipboardList, 
  Search, 
  LayoutDashboard, 
  LogOut, 
  UserCircle,
  FileCheck,
  Users,
  AlertCircle
} from 'lucide-react';
import {
  getAssignments,
  deleteAssignment,
} from '../../api/assignment';
import { getFacultyStats } from '../../api/faculty';

import AssignmentCard from '../../components/AssignmentCard/AssignmentCard';
import AssignmentForm from '../../components/AssignmentForm/AssignmentForm';
import StatCard from '../../components/ui/StatCard';
import FacultyDashboardChart from './components/FacultyDashboardChart';
import styles from './FacultyDashboard.module.css';

const FacultyDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({
    total_assignments: 0,
    total_submissions: 0,
    evaluated_submissions: 0,
    pending_evaluations: 0
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Filters
  const [searchSubject, setSearchSubject] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('deadline');
  const [sortOrder, setSortOrder] = useState('asc');

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [assignmentsData, statsData] = await Promise.all([
        getAssignments({
          subject: searchSubject || undefined,
          status: statusFilter || undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
        }),
        getFacultyStats()
      ]);
      setAssignments(assignmentsData);
      setStats(statsData);
    } catch (err) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        showError('Failed to load dashboard data.');
      }
    } finally {
      setLoading(false);
    }
  }, [searchSubject, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await deleteAssignment(id);
      showSuccess('Assignment deleted successfully.');
      fetchDashboardData();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to delete assignment.');
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAssignment(null);
  };

  return (
    <div className={styles.dashboardContainer}>
      <motion.header 
        className={styles.dashboardHeader}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.headerLeft}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
            <LayoutDashboard size={28} color="var(--primary-color)" />
            <h1>Faculty Portal</h1>
          </div>
          <p>Welcome back, <span style={{ color: 'var(--secondary-color)', fontWeight: '700' }}>{user?.email}</span></p>
        </div>
        <div className={styles.headerRight}>
          <button className="btn-primary" onClick={() => { setEditingAssignment(null); setShowForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> New Assignment
          </button>
          <button className="btn-secondary" onClick={() => navigate('/faculty-dashboard/profile')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCircle size={18} /> Profile
          </button>
          <button className="btn-secondary" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </motion.header>

      {/* Messages */}
      {successMsg && <div className={styles.successMsg}>{successMsg}</div>}
      {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

      <main className={styles.dashboardMain}>
        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {loading ? (
            <>
              <div className={styles.skeletonCard} style={{ height: '100px' }}></div>
              <div className={styles.skeletonCard} style={{ height: '100px' }}></div>
              <div className={styles.skeletonCard} style={{ height: '100px' }}></div>
            </>
          ) : (
            <>
              <StatCard 
                title="Total Assignments" 
                value={stats.total_assignments} 
                icon={ClipboardList} 
                color="#1e3a8a" 
                delay={0.1}
                subtitle="Created by you"
              />
              <StatCard 
                title="Submissions Received" 
                value={stats.total_submissions} 
                icon={Users} 
                color="#3b82f6" 
                delay={0.2} 
                subtitle={`${stats.pending_evaluations} pending review`}
              />
              <StatCard 
                title="Evaluated Work" 
                value={stats.evaluated_submissions} 
                icon={FileCheck} 
                color="#10b981" 
                delay={0.3} 
                subtitle={`${((stats.evaluated_submissions/stats.total_submissions)*100 || 0).toFixed(0)}% Marking progress`}
              />
            </>
          )}
        </div>

        {/* Analytics Section */}
        {!loading && stats.total_submissions > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <FacultyDashboardChart data={stats} />
          </motion.div>
        )}

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              className={styles.searchInput}
              style={{ paddingLeft: '2.5rem' }}
              type="text"
              placeholder="Search by subject..."
              value={searchSubject}
              onChange={(e) => setSearchSubject(e.target.value)}
            />
          </div>
          <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </select>
          <select className={styles.filterSelect} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="deadline">Sort: Deadline</option>
            <option value="created_at">Sort: Created</option>
            <option value="title">Sort: Title</option>
          </select>
          <select className={styles.filterSelect} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="asc">↑ Ascending</option>
            <option value="desc">↓ Descending</option>
          </select>
        </div>

        {/* Assignments Grid */}
        {loading ? (
          <div className={styles.spinner}>
            <div className={styles.spinnerDot}></div>
            <div className={styles.spinnerDot}></div>
            <div className={styles.spinnerDot}></div>
          </div>
        ) : assignments.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon} style={{ color: '#cbd5e1' }}><AlertCircle size={48} /></div>
            <h3>No Assignments Found</h3>
            <p>Try adjusting your filters or create a new assignment.</p>
          </div>
        ) : (
          <div className={styles.assignmentGrid}>
            {assignments.map((a, idx) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
              >
                <AssignmentCard
                  assignment={a}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Form */}
      {showForm && (
        <AssignmentForm
          existingData={editingAssignment}
          onSubmit={() => fetchDashboardData()}
          onCancel={handleCloseForm}
          isLoading={submitting}
        />
      )}
    </div>
  );
};

export default FacultyDashboard;
