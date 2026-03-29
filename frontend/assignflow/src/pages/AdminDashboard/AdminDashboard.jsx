import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  Users, 
  BookOpen, 
  Layers, 
  Layout, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Settings, 
  ShieldCheck, 
  Upload, 
  FileText, 
  Briefcase,
  GraduationCap,
  FileCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  getAdminStats, 
  getAllFaculties, 
  getAllMappings, 
  deleteMapping, 
  getAllowedUsers, 
  createAllowedUser, 
  deleteAllowedUser, 
  uploadAllowedUsersCsv 
} from '../../api/admin';
import { getCourses, getSections, getSubjects, seedAcademicData } from '../../api/academic';
import { createFacultyMapping } from '../../api/academic';
import AdminSubmissionsTab from './components/AdminSubmissionsTab';
import AdminAssignmentsTab from './components/AdminAssignmentsTab';
import StatCard from '../../components/ui/StatCard';
import AdminDashboardChart from './components/AdminDashboardChart';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'overview';

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const currentParam = new URLSearchParams(location.search).get('tab');
    if (currentParam && currentParam !== activeTab) {
      setActiveTab(currentParam);
    }
  }, [location.search]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/admin-dashboard?tab=${tab}`, { replace: true });
  };

  // Data States
  const [stats, setStats] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allowedUsers, setAllowedUsers] = useState([]);

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
  
  const [whitelistForm, setWhitelistForm] = useState({ email: '', role: 'student' });
  const [selectedFile, setSelectedFile] = useState(null);

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
      const [statsData, facultyData, mappingData, courseData, subjectData, allowedUsersData] = await Promise.all([
        getAdminStats(),
        getAllFaculties(),
        getAllMappings(),
        getCourses(),
        getSubjects(),
        getAllowedUsers()
      ]);
      setStats(statsData);
      setFaculties(facultyData);
      setMappings(mappingData);
      setCourses(courseData);
      setSubjects(subjectData);
      setAllowedUsers(allowedUsersData);
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
      const newMappings = await getAllMappings();
      setMappings(newMappings);
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
      setMappings(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to remove mapping.');
    }
  };

  const handleWhitelistFormChange = (e) => {
    const { name, value } = e.target;
    setWhitelistForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateAllowedUser = async (e) => {
    e.preventDefault();
    if (!whitelistForm.email || !whitelistForm.role) return;
    
    setActionLoading(true);
    try {
      await createAllowedUser({ email: whitelistForm.email, role: whitelistForm.role });
      showSuccess(`User ${whitelistForm.email} whitelisted as ${whitelistForm.role}.`);
      setWhitelistForm({ email: '', role: 'student' });
      const newAllowed = await getAllowedUsers();
      setAllowedUsers(newAllowed);
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to whitelist user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAllowedUser = async (id) => {
    if (!window.confirm("Are you sure you want to remove this user from the whitelist? They will lose access immediately.")) return;
    try {
      await deleteAllowedUser(id);
      showSuccess('User removed from whitelist.');
      setAllowedUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      showError('Failed to remove user from whitelist.');
    }
  };

  const handleUploadCSV = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showError('Please select a CSV file first.');
      return;
    }
    
    setActionLoading(true);
    try {
      const result = await uploadAllowedUsersCsv(selectedFile);
      showSuccess(`Upload complete. Added: ${result.added}, Skipped/Duplicates: ${result.skipped}.`);
      setSelectedFile(null);
      const fileInput = document.getElementById('csv-upload-input');
      if (fileInput) fileInput.value = "";
      const newAllowed = await getAllowedUsers();
      setAllowedUsers(newAllowed);
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to process CSV file. Make sure it is formatted correctly.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSeedData = async () => {
    if (!window.confirm("This will initialize/seed the academic data. Are you sure?")) return;
    setActionLoading(true);
    try {
      await seedAcademicData();
      showSuccess('Academic data seeded successfully!');
      fetchData(); 
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
      <motion.header 
        className={styles.dashboardHeader}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.headerLeft}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
            <ShieldCheck size={32} color="var(--primary-color)" />
            <h1>Admin Portal</h1>
          </div>
          <p>Welcome back, <span style={{ color: 'var(--secondary-color)', fontWeight: '700' }}>System Administrator</span></p>
        </div>
      </motion.header>

      {successMsg && <div className={styles.successMsg}>{successMsg}</div>}
      {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

      <div className={styles.tabContainer}>
        {[
          { id: 'overview', label: 'System Overview', icon: Layout },
          { id: 'mappings', label: 'Faculty Mappings', icon: Layers },
          { id: 'submissions', label: 'Student Submissions', icon: FileText },
          { id: 'assignments', label: 'Faculty Assignments', icon: Briefcase },
          { id: 'whitelist', label: 'User Whitelist', icon: ShieldCheck },
          { id: 'tools', label: 'System Tools', icon: Settings },
        ].map(tab => (
          <button
            key={tab.id}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, x: 10 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -10 }}
           transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className={styles.overviewSection}>
              {/* Dynamic Stats Row */}
              <div className={styles.statsGrid}>
                <StatCard 
                  title="Total Students" 
                  value={stats?.total_students || 0} 
                  icon={GraduationCap} 
                  color="#10b981" 
                  delay={0.1}
                  subtitle="Active on platform"
                />
                <StatCard 
                  title="Total Faculty" 
                  value={stats?.total_faculty || 0} 
                  icon={Briefcase} 
                  color="#3b82f6" 
                  delay={0.2}
                  subtitle="Managing subjects"
                />
                <StatCard 
                  title="Assignments" 
                  value={stats?.total_assignments || 0} 
                  icon={Layers} 
                  color="#1e3a8a" 
                  delay={0.3}
                  subtitle="Curated by faculty"
                />
                <StatCard 
                  title="Submissions" 
                  value={stats?.total_submissions || 0} 
                  icon={FileCheck} 
                  color="#6366f1" 
                  delay={0.4}
                  subtitle="System total"
                />
                <StatCard 
                  title="Total Courses" 
                  value={stats?.total_courses || 0} 
                  icon={BookOpen} 
                  color="#f59e0b" 
                  delay={0.5}
                  subtitle="Academic units"
                />
              </div>

              {/* System Analytics Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <AdminDashboardChart data={stats} />
              </motion.div>
            </div>
          )}

          {activeTab === 'mappings' && (
            <div className={styles.tabContent}>
              <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', fontSize: '1.4rem' }}>
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
                      <label>Course (Filter)</label>
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
                  <button type="submit" className="btn-primary" disabled={actionLoading} style={{ width: 'fit-content' }}>
                    {actionLoading ? 'Assigning...' : 'Complete Mapping'}
                  </button>
                </form>
              </div>

              <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: 0, fontSize: '1.4rem' }}>
                    <Layers size={24} color="var(--primary-color)" /> Active Faculty Assignments
                  </h2>
                  <button className="btn-secondary" onClick={() => getAllMappings().then(setMappings)} style={{ padding: '0.6rem' }}>
                    <RefreshCw size={18} />
                  </button>
                </div>

                {mappings.length === 0 ? (
                  <p style={{ color: '#64748b', fontStyle: 'italic' }}>No faculty mappings exist yet.</p>
                ) : (
                  <>
                    <div className={styles.desktopOnly}>
                      <table className={styles.mappingTable}>
                        <thead>
                          <tr>
                            <th>Faculty</th>
                            <th>Subject</th>
                            <th>Assigned Section</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mappings.map(m => (
                            <tr key={m.id}>
                              <td>
                                <div style={{ fontWeight: 700, color: 'var(--secondary-color)' }}>{m.faculty_name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{m.faculty_email}</div>
                              </td>
                              <td><div style={{ fontWeight: 600 }}>{m.subject_name}</div></td>
                              <td>
                                <span style={{ background: 'var(--secondary-color)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                                  {m.section_label}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button onClick={() => handleDeleteMapping(m.id)} className={styles.deleteBtn} title="Remove Mapping">
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className={styles.mobileOnly}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {mappings.map(m => (
                          <div key={m.id} className="glass-card" style={{ padding: '1.25rem', background: '#fff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--secondary-color)' }}>{m.faculty_name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{m.faculty_email}</div>
                              </div>
                              <button onClick={() => handleDeleteMapping(m.id)} className={styles.deleteBtn}><Trash2 size={16} /></button>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Subject</div>
                                <div style={{ fontWeight: 600 }}>{m.subject_name}</div>
                              </div>
                              <span style={{ background: 'var(--secondary-color)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                {m.section_label}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'submissions' && <AdminSubmissionsTab />}
          
          {activeTab === 'assignments' && <AdminAssignmentsTab />}

          {activeTab === 'whitelist' && (
            <div className={styles.tabContent}>
              <div className={styles.statsGrid}>
                <div className="glass-card" style={{ padding: '2rem' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', fontSize: '1.4rem' }}>
                    <Plus size={24} color="var(--primary-color)" /> Manual Add
                  </h2>
                  <form onSubmit={handleCreateAllowedUser} className={styles.mappingForm}>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup} style={{ flex: 2 }}>
                        <label>Email Address *</label>
                        <input type="email" name="email" value={whitelistForm.email} onChange={handleWhitelistFormChange} required placeholder="user@iilm.edu" />
                      </div>
                      <div className={styles.formGroup} style={{ flex: 1 }}>
                        <label>Role *</label>
                        <select name="role" value={whitelistForm.role} onChange={handleWhitelistFormChange} required>
                          <option value="student">Student</option>
                          <option value="faculty">Faculty</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="btn-primary" disabled={actionLoading}>
                      {actionLoading ? 'Saving...' : 'Whitelist User'}
                    </button>
                  </form>
                </div>

                <div className="glass-card" style={{ padding: '2rem' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', fontSize: '1.4rem' }}>
                    <Upload size={24} color="var(--primary-color)" /> Bulk CSV Upload
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Process large batches using a CSV with <strong>email</strong> and <strong>role</strong>.
                  </p>
                  <form onSubmit={handleUploadCSV} className={styles.mappingForm}>
                    <div className={styles.formGroup}>
                      <input type="file" accept=".csv" onChange={(e) => setSelectedFile(e.target.files[0])} required style={{ padding: '0.8rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }} id="csv-upload-input" />
                    </div>
                    <button type="submit" className="btn-secondary" disabled={actionLoading || !selectedFile}>
                      {actionLoading ? 'Processing...' : 'Process CSV File'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: 0, fontSize: '1.4rem' }}>
                    <ShieldCheck size={24} color="var(--primary-color)" /> Whitelisted Directory
                  </h2>
                  <button className="btn-secondary" onClick={() => getAllowedUsers().then(setAllowedUsers)} style={{ padding: '0.6rem' }}>
                    <RefreshCw size={18} />
                  </button>
                </div>

                {allowedUsers.length === 0 ? (
                  <p style={{ color: '#64748b', fontStyle: 'italic' }}>Whitelist is currently empty.</p>
                ) : (
                  <>
                    <div className={styles.desktopOnly}>
                      <table className={styles.mappingTable}>
                        <thead>
                          <tr>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allowedUsers.map(u => (
                            <tr key={u.id}>
                              <td style={{ fontWeight: 700, color: 'var(--secondary-color)' }}>{u.email}</td>
                              <td>
                                <span style={{ 
                                  background: u.role === 'admin' ? '#fee2e2' : u.role === 'faculty' ? '#e0e7ff' : '#dcfce7', 
                                  color: u.role === 'admin' ? '#991b1b' : u.role === 'faculty' ? '#3730a3' : '#166534', 
                                  padding: '0.2rem 0.6rem', 
                                  borderRadius: '4px', 
                                  fontSize: '0.85rem',
                                  fontWeight: 700,
                                  textTransform: 'capitalize' 
                                }}>
                                  {u.role}
                                </span>
                              </td>
                              <td>
                                {u.is_active ? 
                                  <span style={{ color: '#166534', fontSize: '0.85rem', fontWeight: 800 }}>● Active</span> 
                                  : <span style={{ color: '#991b1b', fontSize: '0.85rem', fontWeight: 800 }}>● Inactive</span>
                                }
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button onClick={() => handleDeleteAllowedUser(u.id)} className={styles.deleteBtn}>
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className={styles.mobileOnly}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {allowedUsers.map(u => (
                          <div key={u.id} className="glass-card" style={{ padding: '1.25rem', background: '#fff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                              <div style={{ fontWeight: 700, color: 'var(--secondary-color)', wordBreak: 'break-all', flex: 1, marginRight: '1rem' }}>{u.email}</div>
                              <button onClick={() => handleDeleteAllowedUser(u.id)} className={styles.deleteBtn}><Trash2 size={16} /></button>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ 
                                background: u.role === 'admin' ? '#fee2e2' : u.role === 'faculty' ? '#e0e7ff' : '#dcfce7', 
                                color: u.role === 'admin' ? '#991b1b' : u.role === 'faculty' ? '#3730a3' : '#166534', 
                                padding: '0.2rem 0.6rem', 
                                borderRadius: '4px', 
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                textTransform: 'capitalize' 
                              }}>
                                {u.role}
                              </span>
                              {u.is_active ? 
                                <span style={{ color: '#166534', fontSize: '0.8rem', fontWeight: 800 }}>Active</span> 
                                : <span style={{ color: '#991b1b', fontSize: '0.8rem', fontWeight: 800 }}>Inactive</span>
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="fade-in">
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', fontSize: '1.4rem' }}>
                  <Settings size={24} color="var(--primary-color)" /> System Configuration
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Academic Data Seed</h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>Initialize/Reset the default set of courses, subjects, and sections.</p>
                    <button className="btn-primary" onClick={handleSeedData} disabled={actionLoading}>
                      {actionLoading ? 'Processing...' : 'Start Data Seeding'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
