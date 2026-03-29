import React, { useState, useEffect, useCallback } from 'react';
import { getSystemSubmissions } from '../../../api/admin';
import { Search, Filter, Eye, Download, X, Calendar, User, Book, Hash } from 'lucide-react';
import styles from '../AdminDashboard.module.css';

const AdminSubmissionsTab = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    year: '',
    course: '',
    section: '',
    subject: ''
  });
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      // Clean empty filters
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const data = await getSystemSubmissions(activeFilters);
      setSubmissions(data);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const openDetails = (sub) => setSelectedSubmission(sub);
  const closeDetails = () => setSelectedSubmission(null);

  if (loading && submissions.length === 0) {
    return <div className={styles.spinnerWrapper}><div className="spinner-dot"></div></div>;
  }

  return (
    <div className="fade-in">
      {/* Filter Panel */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Filter size={20} color="var(--primary-color)" />
          <h3 style={{ margin: 0 }}>Filter Submissions</h3>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Batch / Year</label>
            <select name="year" value={filters.year} onChange={handleFilterChange}>
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Course</label>
            <input 
              type="text" 
              name="course" 
              placeholder="e.g. B.Tech" 
              value={filters.course} 
              onChange={handleFilterChange} 
            />
          </div>
          <div className={styles.formGroup}>
            <label>Section</label>
            <input 
              type="text" 
              name="section" 
              placeholder="e.g. A" 
              value={filters.section} 
              onChange={handleFilterChange} 
            />
          </div>
          <div className={styles.formGroup}>
            <label>Subject</label>
            <input 
              type="text" 
              name="subject" 
              placeholder="e.g. DSA" 
              value={filters.subject} 
              onChange={handleFilterChange} 
            />
          </div>
        </div>
      </div>

      {/* Submissions Table / View */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Student Submissions</h2>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Showing {submissions.length} records</span>
        </div>

        {submissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <Search size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>No submissions found matching the criteria.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className={styles.desktopOnly} style={{ overflowX: 'auto' }}>
              <table className={styles.mappingTable}>
                <thead>
                  <tr>
                    <th>Student Info</th>
                    <th>Assignment</th>
                    <th>Course/Section</th>
                    <th>Submitted At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.submission_id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--secondary-color)' }}>{sub.student_name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>URN: {sub.student_urn}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{sub.assignment_title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 600 }}>{sub.assignment_subject}</div>
                      </td>
                      <td>
                        <span className={styles.badge}>
                          {sub.student_course} / {sub.student_section} (Yr {sub.student_year})
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{new Date(sub.submitted_at).toLocaleDateString()}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(sub.submitted_at).toLocaleTimeString()}</div>
                      </td>
                      <td>
                        <button 
                          className={styles.viewBtn} 
                          onClick={() => openDetails(sub)}
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className={styles.mobileOnly}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {submissions.map((sub) => (
                  <div key={sub.submission_id} className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--secondary-color)' }}>{sub.student_name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>URN: {sub.student_urn}</div>
                      </div>
                      <span className={styles.badge}>{sub.student_course} / {sub.student_section}</span>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.2rem' }}>Assignment</div>
                      <div style={{ fontWeight: 600 }}>{sub.assignment_title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>{sub.assignment_subject}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {new Date(sub.submitted_at).toLocaleDateString()} at {new Date(sub.submitted_at).toLocaleTimeString()}
                      </div>
                      <button className="btn-secondary" onClick={() => openDetails(sub)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Details Modal */}
      {selectedSubmission && (
        <div className={styles.modalOverlay} onClick={closeDetails}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Submission Details</h2>
              <button onClick={closeDetails}><X size={24} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailsGrid}>
                <section>
                  <h3><User size={18} /> Student Information</h3>
                  <p><strong>Name:</strong> {selectedSubmission.student_name}</p>
                  <p><strong>URN:</strong> {selectedSubmission.student_urn}</p>
                  <p><strong>Course:</strong> {selectedSubmission.student_course}</p>
                  <p><strong>Batch:</strong> {selectedSubmission.student_year} Year</p>
                  <p><strong>Section:</strong> {selectedSubmission.student_section}</p>
                </section>
                <section>
                  <h3><Book size={18} /> Assignment Information</h3>
                  <p><strong>Title:</strong> {selectedSubmission.assignment_title}</p>
                  <p><strong>Subject:</strong> {selectedSubmission.assignment_subject}</p>
                  <p><strong>Submitted At:</strong> {new Date(selectedSubmission.submitted_at).toLocaleString()}</p>
                  <p><strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedSubmission.status}</span></p>
                </section>
              </div>
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <a 
                  href={selectedSubmission.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Download size={18} /> Download / View Submission File
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubmissionsTab;
