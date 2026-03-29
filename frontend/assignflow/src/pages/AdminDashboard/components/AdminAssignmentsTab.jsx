import React, { useState, useEffect, useCallback } from 'react';
import { getSystemAssignments } from '../../../api/admin';
import { Search, Filter, Eye, Download, X, Calendar, User, Book, Hash } from 'lucide-react';
import styles from '../AdminDashboard.module.css';

const AdminAssignmentsTab = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    faculty_name: '',
    department: '',
    subject: '',
    status: ''
  });
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const data = await getSystemAssignments(activeFilters);
      setAssignments(data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const openDetails = (assg) => setSelectedAssignment(assg);
  const closeDetails = () => setSelectedAssignment(null);

  if (loading && assignments.length === 0) {
    return <div className={styles.spinnerWrapper}><div className="spinner-dot"></div></div>;
  }

  return (
    <div className="fade-in">
      {/* Filter Panel */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Filter size={20} color="var(--primary-color)" />
          <h3 style={{ margin: 0 }}>Filter Assignments</h3>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Faculty Name</label>
            <input 
              type="text" 
              name="faculty_name" 
              placeholder="e.g. Dr. Sharma" 
              value={filters.faculty_name} 
              onChange={handleFilterChange} 
            />
          </div>
          <div className={styles.formGroup}>
            <label>Department</label>
            <input 
              type="text" 
              name="department" 
              placeholder="e.g. CSE" 
              value={filters.department} 
              onChange={handleFilterChange} 
            />
          </div>
          <div className={styles.formGroup}>
            <label>Subject</label>
            <input 
              type="text" 
              name="subject" 
              placeholder="e.g. Java" 
              value={filters.subject} 
              onChange={handleFilterChange} 
            />
          </div>
          <div className={styles.formGroup}>
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments Table / View */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Faculty Assignments</h2>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Showing {assignments.length} records</span>
        </div>

        {assignments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <Search size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>No assignments found matching the criteria.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className={styles.desktopOnly} style={{ overflowX: 'auto' }}>
              <table className={styles.mappingTable}>
                <thead>
                  <tr>
                    <th>Assignment Info</th>
                    <th>Faculty</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assg) => (
                    <tr key={assg.assignment_id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--secondary-color)' }}>{assg.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 600 }}>{assg.subject}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{assg.faculty_name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{assg.faculty_department} ({assg.faculty_employee_id})</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{new Date(assg.deadline).toLocaleDateString()}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(assg.deadline).toLocaleTimeString()}</div>
                      </td>
                      <td>
                        <span style={{ 
                          background: assg.status === 'published' ? '#dcfce7' : assg.status === 'closed' ? '#fee2e2' : '#f1f5f9', 
                          color: assg.status === 'published' ? '#166534' : assg.status === 'closed' ? '#991b1b' : '#64748b', 
                          padding: '0.2rem 0.6rem', 
                          borderRadius: '4px', 
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          textTransform: 'capitalize' 
                        }}>
                          {assg.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={styles.viewBtn} 
                          onClick={() => openDetails(assg)}
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
                {assignments.map((assg) => (
                  <div key={assg.assignment_id} className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: 'var(--secondary-color)' }}>{assg.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 600 }}>{assg.subject}</div>
                      </div>
                      <span style={{ 
                        background: assg.status === 'published' ? '#dcfce7' : assg.status === 'closed' ? '#fee2e2' : '#f1f5f9', 
                        color: assg.status === 'published' ? '#166534' : assg.status === 'closed' ? '#991b1b' : '#64748b', 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'capitalize' 
                      }}>
                        {assg.status}
                      </span>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Faculty</div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{assg.faculty_name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{assg.faculty_department} ({assg.faculty_employee_id})</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Due: {new Date(assg.deadline).toLocaleDateString()}
                      </div>
                      <button className="btn-secondary" onClick={() => openDetails(assg)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
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
      {selectedAssignment && (
        <div className={styles.modalOverlay} onClick={closeDetails}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Assignment Details</h2>
              <button onClick={closeDetails}><X size={24} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailsGrid}>
                <section>
                  <h3><User size={18} /> Faculty Information</h3>
                  <p><strong>Name:</strong> {selectedAssignment.faculty_name}</p>
                  <p><strong>Employee ID:</strong> {selectedAssignment.faculty_employee_id}</p>
                  <p><strong>Department:</strong> {selectedAssignment.faculty_department}</p>
                  <p><strong>Designation:</strong> {selectedAssignment.faculty_designation}</p>
                </section>
                <section>
                  <h3><Book size={18} /> Assignment Information</h3>
                  <p><strong>Title:</strong> {selectedAssignment.title}</p>
                  <p><strong>Subject:</strong> {selectedAssignment.subject}</p>
                  <p><strong>Deadline:</strong> {new Date(selectedAssignment.deadline).toLocaleString()}</p>
                  <p><strong>Marks:</strong> {selectedAssignment.max_marks} Total</p>
                  <p><strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedAssignment.status}</span></p>
                </section>
                <section style={{ gridColumn: '1 / -1' }}>
                  <h3><Calendar size={18} /> Description</h3>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{selectedAssignment.description || 'No description provided.'}</p>
                </section>
              </div>
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                {selectedAssignment.file_url ? (
                  <a 
                    href={selectedAssignment.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Download size={18} /> Download / View Assignment File
                  </a>
                ) : (
                  <p style={{ color: '#64748b' }}>No reference file uploaded for this assignment.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssignmentsTab;
