import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Users, BookOpen, Layers, Layout, Trash2, Plus, RefreshCw, Settings } from 'lucide-react';
import { getAdminStats, getAllFaculties, getAllMappings, deleteMapping } from '../../api/admin';
import { getCourses, getSections, getSubjects, seedAcademicData } from '../../api/academic';
import { createFacultyMapping } from '../../api/academic';
import styles from './AdminDashboard.module.css'; // We will create this

const AdminDashboard = () => {
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState('overview');

  // Data States
  const [stats, setStats] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    faculty_id: '',
    course_id: '',
    section_id: '',
    subject_id: ''
  });

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, facultyData, mappingData, courseData, subjectData] = await Promise.all([
        getAdminStats(),
        getAllFaculties(),
        getAllMappings(),
        getCourses(),
        getSubjects()
      ]);
      setStats(statsData);
      setFaculties(facultyData);
      setMappings(mappingData);
      setCourses(courseData);
      setSubjects(subjectData);
    } catch (err) {
      showError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch sections when course changes
  useEffect(() => {
    const fetchSections = async () => {
      if (!formData.course_id) {
        setSections([]);
        setFormData(prev => ({ ...prev, section_id: '' }));
        return;
      }
      try {
        const data = await getSections(formData.course_id);
        setSections(data);
        // Reset section selection
        setFormData(prev => ({ ...prev, section_id: '' }));
      } catch (err) {
        showError('Failed to load sections.');
      }
    };
    fetchSections();
  }, [formData.course_id]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateMapping = async (e) => {
    e.preventDefault();
    if (!formData.faculty_id || !formData.section_id || !formData.subject_id) {
      showError('Please select Faculty, Subject, and Section.');
      return;
    }

    setActionLoading(true);
    try {
      await createFacultyMapping({
        faculty_id: parseInt(formData.faculty_id),
        subject_id: parseInt(formData.subject_id),
        section_id: parseInt(formData.section_id)
      });
      showSuccess('Faculty mapped successfully!');
      // Refresh mappings
      const newMappings = await getAllMappings();
      setMappings(newMappings);
      // Reset form
      setFormData({ faculty_id: '', course_id: '', section_id: '', subject_id: '' });
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to map faculty.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMapping = async (id) => {
    if (!window.confirm("Are you sure you want to remove this mapping?")) return;
    try {
      await deleteMapping(id);
      showSuccess('Mapping removed.');
      // Update state without full refetch
      setMappings(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to remove mapping.');
    }
  };

  const handleSeedData = async () => {
    if (!window.confirm("This will initialize/seed the academic data. Are you sure?")) return;
    setActionLoading(true);
    try {
      await seedAcademicData();
      showSuccess('Academic data seeded successfully!');
      fetchData(); // Refresh all data
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to seed data.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.spinnerWrapper}>
        <div className="spinner-dot"></div>
        <div className="spinner-dot"></div>
        <div className="spinner-dot"></div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <h1>Admin Portal</h1>
          <p>Welcome back, Administrator</p>
        </div>
      </header>

      {successMsg && <div className={styles.successMsg}>{successMsg}</div>}
      {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Layout size={18} /> System Overview
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'mappings' ? styles.active : ''}`}
          onClick={() => setActiveTab('mappings')}
        >
          <Layers size={18} /> Faculty Mappings
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'tools' ? styles.active : ''}`}
          onClick={() => setActiveTab('tools')}
        >
          <Settings size={18} /> System Tools
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className={styles.statsGrid}>
          <div className="glass-card fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
            <Users size={32} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{stats?.total_students || 0}</h2>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Total Students</p>
          </div>
          <div className="glass-card fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
            <Users size={32} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{stats?.total_faculty || 0}</h2>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Total Faculty</p>
          </div>
          <div className="glass-card fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
            <BookOpen size={32} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{stats?.total_courses || 0}</h2>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Courses</p>
          </div>
          <div className="glass-card fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
            <Layers size={32} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{stats?.total_assignments || 0}</h2>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Assignments Posted</p>
          </div>
        </div>
      )}

      {activeTab === 'mappings' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Plus size={24} color="var(--primary-color)" /> Assign Faculty to Section
            </h2>
            <form onSubmit={handleCreateMapping} className={styles.mappingForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Faculty Member *</label>
                  <select name="faculty_id" value={formData.faculty_id} onChange={handleFormChange} required>
                    <option value="">Select Faculty</option>
                    {faculties.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.email})</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Subject *</label>
                  <select name="subject_id" value={formData.subject_id} onChange={handleFormChange} required>
                    <option value="">Select Subject</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Course (for filtering sections)</label>
                  <select name="course_id" value={formData.course_id} onChange={handleFormChange}>
                    <option value="">Select Course</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Section *</label>
                  <select name="section_id" value={formData.section_id} onChange={handleFormChange} required disabled={!formData.course_id}>
                    <option value="">{formData.course_id ? 'Select Section' : 'Select a course first'}</option>
                    {sections.map(s => (
                      <option key={s.id} value={s.id}>Year {s.year} - {s.section_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={actionLoading} style={{ marginTop: '1rem' }}>
                {actionLoading ? 'Assigning...' : 'Assign to Section'}
              </button>
            </form>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Layers size={24} color="var(--primary-color)" /> Active Faculty Mappings
              </h2>
              <button className="btn-secondary" onClick={() => getAllMappings().then(setMappings)} style={{ padding: '0.5rem' }}>
                <RefreshCw size={18} />
              </button>
            </div>

            {mappings.length === 0 ? (
              <p style={{ color: '#64748b' }}>No faculty mappings exist yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.mappingTable}>
                  <thead>
                    <tr>
                      <th>Faculty</th>
                      <th>Subject</th>
                      <th>Assigned Section</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappings.map(m => (
                      <tr key={m.id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{m.faculty_name}</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{m.faculty_email}</div>
                        </td>
                        <td>{m.subject_name}</td>
                        <td>
                          <span style={{ background: 'var(--secondary-color)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                            {m.section_label}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteMapping(m.id)}
                            className={styles.deleteBtn}
                            title="Remove Mapping"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tools' && (
        <div className="fade-in">
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings size={24} color="var(--primary-color)" /> System Configuration
            </h2>
            <div className={styles.toolsGrid}>
              <div className={styles.toolCard}>
                <h3>Initialize Academic Structure</h3>
                <p>Seed the database with default Courses, Sections, and Subjects (B.Tech, BBA, BCA, etc.). This is safe to run multiple times.</p>
                <button
                  className="btn-primary"
                  onClick={handleSeedData}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Seeding...' : 'Run Seed Data Operation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
