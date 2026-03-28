import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Plus, ClipboardList, Search } from 'lucide-react';
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from '../../api/assignment';

import AssignmentCard from '../../components/AssignmentCard/AssignmentCard';
import AssignmentForm from '../../components/AssignmentForm/AssignmentForm';
import styles from './FacultyDashboard.module.css';

const FacultyDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
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

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await getAssignments({
        subject: searchSubject || undefined,
        status: statusFilter || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setAssignments(data);
    } catch (err) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        showError('Failed to load assignments.');
      }
    } finally {
      setLoading(false);
    }
  }, [searchSubject, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleCreate = async (formData) => {
    setSubmitting(true);
    try {
      await createAssignment(formData);
      setShowForm(false);
      showSuccess('Assignment created successfully!');
      fetchAssignments();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to create assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (formData) => {
    if (!editingAssignment) return;
    setSubmitting(true);
    try {
      await updateAssignment(editingAssignment.id, formData);
      setShowForm(false);
      setEditingAssignment(null);
      showSuccess('Assignment updated successfully!');
      fetchAssignments();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to update assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAssignment(id);
      showSuccess('Assignment deleted.');
      fetchAssignments();
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Stats
  const totalAssignments = assignments.length;
  const publishedCount = assignments.filter((a) => a.status === 'published').length;
  const pastDeadline = assignments.filter((a) => new Date(a.deadline) < new Date()).length;

  return (
    <div className={styles.dashboardContainer}>
      {/* Header */}
      <header className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <h1>Faculty Portal</h1>
          <p>Welcome back, {user?.email}</p>
        </div>
        <div className={styles.headerRight}>
          <button className="btn-primary" onClick={() => { setEditingAssignment(null); setShowForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> New Assignment
          </button>
          <button className="btn-secondary" onClick={() => navigate('/faculty-dashboard/profile')}>
            Profile
          </button>
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Messages */}
      {successMsg && <div className={styles.successMsg}>{successMsg}</div>}
      {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={`glass-card ${styles.statCard}`}>
          <div className={styles.statNumber}>{totalAssignments}</div>
          <div className={styles.statLabel}>Total</div>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <div className={styles.statNumber}>{publishedCount}</div>
          <div className={styles.statLabel}>Published</div>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <div className={styles.statNumber}>{pastDeadline}</div>
          <div className={styles.statLabel}>Past Deadline</div>
        </div>
      </div>

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

      {/* Content */}
      {loading ? (
        <div className={styles.spinner}>
          <div className={styles.spinnerDot}></div>
          <div className={styles.spinnerDot}></div>
          <div className={styles.spinnerDot}></div>
        </div>
      ) : assignments.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon} style={{ color: '#cbd5e1' }}><ClipboardList size={48} /></div>
          <h3>No Assignments Yet</h3>
          <p>Create your first assignment to start managing your academic workflow.</p>
          <button className="btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Create Assignment
          </button>
        </div>
      ) : (
        <div className={styles.assignmentGrid}>
          {assignments.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <AssignmentForm
          existingData={editingAssignment}
          onSubmit={editingAssignment ? handleUpdate : handleCreate}
          onCancel={handleCloseForm}
          isLoading={submitting}
        />
      )}
    </div>
  );
};

export default FacultyDashboard;
