import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Download, 
  Eye, 
  User, 
  Calendar, 
  Clock, 
  FileText,
  Edit2,
  CheckCircle,
  XCircle,
  Save,
  Loader
} from 'lucide-react';
import api from '../../api/axiosConfig';
import styles from './FacultySubmissionReview.module.css';

const FacultySubmissionReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Evaluation states
  const [editModeId, setEditModeId] = useState(null);
  const [evalData, setEvalData] = useState({ marks_obtained: '', feedback: '', status: 'pending' });
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch assignment details first to show title, max marks, etc. (optional but UX friendly)
      const assignmentRes = await api.get(`/assignments/${id}`);
      setAssignment(assignmentRes.data);

      // Fetch submissions
      const submissionsRes = await api.get(`/assignments/${id}/submissions`);
      setSubmissions(submissionsRes.data);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions. Make sure the assignment exists and you have permission to view it.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'submitted': return styles.statusSubmitted;
      case 'reviewed': return styles.statusReviewed;
      case 'late': return styles.statusLate;
      case 'pending': return styles.statusPending;
      default: return styles.statusPending;
    }
  };

  const handleEditClick = (sub) => {
    setEditModeId(sub.id);
    setEvalData({
      marks_obtained: sub.marks_obtained !== null && sub.marks_obtained !== undefined ? sub.marks_obtained : '',
      feedback: sub.feedback || '',
      status: sub.status || 'pending'
    });
  };

  const handleCancelEdit = () => {
    setEditModeId(null);
  };

  const handleSaveEvaluation = async (subId) => {
    try {
      setSavingId(subId);
      setError(null);
      setSuccessMsg(null);

      const payload = {
        marks_obtained: evalData.marks_obtained === '' ? null : Number(evalData.marks_obtained),
        feedback: evalData.feedback,
        status: evalData.status
      };

      const res = await api.put(`/faculty/submissions/${subId}/evaluate`, payload);

      setSubmissions((prev) => prev.map((s) => (s.id === subId ? { ...s, ...res.data } : s)));
      setEditModeId(null);
      setSuccessMsg('Evaluation saved successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      setError(err.response?.data?.detail || 'Failed to save evaluation.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSavingId(null);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const query = searchQuery.toLowerCase();
    return (
      sub.student_name.toLowerCase().includes(query) ||
      sub.student_urn.toLowerCase().includes(query)
    );
  });

  return (
    <div className={styles.reviewContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate('/faculty-dashboard')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={styles.pageTitle}>Submissions Review</h1>
            {assignment && (
              <p className={styles.assignmentMeta}>
                {assignment.title} • {assignment.subject_name || assignment.subject} • Deadline: {formatDate(assignment.deadline)}
              </p>
            )}
          </div>
        </div>
        
        <div className={styles.statsCard}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{submissions.length}</span>
            <span className={styles.statLabel}>Total Submissions</span>
          </div>
        </div>
      </header>

      <div className={styles.controlsSection}>
        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by student name or URN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {successMsg && (
        <div className={styles.successToast}>
          <CheckCircle size={20} />
          {successMsg}
        </div>
      )}

      {error && !loading && (
        <div className={styles.errorToast}>
          <XCircle size={20} />
          {error}
        </div>
      )}

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading submissions...</p>
        </div>
      ) : error ? (
        <div className={styles.errorState}>
          <p>{error}</p>
          <button onClick={fetchData} className="btn-primary">Retry</button>
        </div>
      ) : submissions.length === 0 ? (
        <div className={styles.emptyState}>
          <FileText size={48} className={styles.emptyIcon} />
          <h3>No submissions yet.</h3>
          <p>Students haven't submitted this assignment yet.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className={styles.tableWrapper}>
            <table className={styles.submissionsTable}>
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Course details</th>
                  <th>Submitted At</th>
                  <th>Evaluation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((sub) => {
                    const isEditing = editModeId === sub.id;
                    const isSaving = savingId === sub.id;

                    return (
                    <tr key={sub.id} className={isEditing ? styles.editingRow : ''}>
                      <td>
                        <div className={styles.studentInfo}>
                          <div className={styles.studentAvatar}>
                            <User size={16} />
                          </div>
                          <div>
                            <div className={styles.studentName}>{sub.student_name}</div>
                            <div className={styles.studentURN}>URN: {sub.student_urn}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.courseInfo}>
                          {sub.student_course} - {sub.student_branch}
                          <div className={styles.sectionInfo}>
                            Yr {sub.student_year}, Sem {sub.student_sem}
                            <span className={styles.sectionBadge}>Sec {sub.student_section}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.timeInfo}>
                          <Clock size={14} />
                          {formatDate(sub.submitted_at)}
                        </div>
                        <div className={styles.documentLink}>
                          <a
                            href={sub.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.viewDocBtn}
                            title="View Document"
                          >
                            <Download size={14} />
                            <span>View Doc</span>
                          </a>
                        </div>
                      </td>
                      <td className={styles.evaluationCell}>
                        {isEditing ? (
                          <div className={styles.evalFormDesk}>
                            <div className={styles.evalInputGroup}>
                              <label>Marks</label>
                              <input 
                                type="number" 
                                min="0" 
                                max="100" 
                                className={styles.evalInput}
                                value={evalData.marks_obtained}
                                onChange={(e) => setEvalData({...evalData, marks_obtained: e.target.value})}
                              />
                            </div>
                            <div className={styles.evalInputGroup}>
                              <label>Status</label>
                              <select 
                                className={styles.evalSelect}
                                value={evalData.status}
                                onChange={(e) => setEvalData({...evalData, status: e.target.value})}
                              >
                                <option value="pending">Pending</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="late">Late</option>
                              </select>
                            </div>
                            <div className={styles.evalInputGroupFull}>
                              <label>Feedback</label>
                              <textarea 
                                className={styles.evalTextarea}
                                placeholder="Add comments..."
                                value={evalData.feedback}
                                onChange={(e) => setEvalData({...evalData, feedback: e.target.value})}
                              ></textarea>
                            </div>
                          </div>
                        ) : (
                          <div className={styles.evalDisplay}>
                            <div className={styles.evalTop}>
                              <span className={`${styles.statusBadge} ${getStatusClass(sub.status)}`}>
                                {sub.status || 'Pending'}
                              </span>
                              {sub.marks_obtained !== null && sub.marks_obtained !== undefined && (
                                <span className={styles.marksBadge}>{sub.marks_obtained} Pts</span>
                              )}
                            </div>
                            {sub.feedback && <div className={styles.feedbackText}>"{sub.feedback}"</div>}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className={styles.actions}>
                          {isEditing ? (
                            <>
                              <button 
                                onClick={() => handleSaveEvaluation(sub.id)} 
                                className={`${styles.actionBtn} ${styles.saveBtn}`}
                                disabled={isSaving}
                              >
                                {isSaving ? <Loader size={18} className={styles.spin} /> : <Save size={18} />}
                                <span>Save</span>
                              </button>
                              <button 
                                onClick={handleCancelEdit} 
                                className={`${styles.actionBtn} ${styles.cancelBtn}`}
                                disabled={isSaving}
                              >
                                <XCircle size={18} />
                                <span>Cancel</span>
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => handleEditClick(sub)} 
                              className={`${styles.actionBtn} ${styles.editBtn}`}
                            >
                              <Edit2 size={18} />
                              <span>Evaluate</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
                ) : (
                  <tr>
                    <td colSpan="5" className={styles.noResults}>
                      No students found matching "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className={styles.mobileCardsList}>
            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((sub) => {
                const isEditing = editModeId === sub.id;
                const isSaving = savingId === sub.id;

                return (
                <div key={sub.id} className={`glass-card ${styles.mobileCard} ${isEditing ? styles.editingCard : ''}`}>
                  <div className={styles.mCardHeader}>
                    <div className={styles.studentName}>{sub.student_name}</div>
                    <span className={`${styles.statusBadge} ${getStatusClass(sub.status)}`}>
                      {sub.status || 'Pending'}
                    </span>
                  </div>
                  
                  <div className={styles.mCardBody}>
                    <div className={styles.mInfoRow}>
                      <span className={styles.mLabel}>URN:</span>
                      <span className={styles.mValue}>{sub.student_urn}</span>
                    </div>
                    <div className={styles.mInfoRow}>
                      <span className={styles.mLabel}>Course:</span>
                      <span className={styles.mValue}>{sub.student_course} - {sub.student_branch}</span>
                    </div>
                    <div className={styles.mInfoRow}>
                      <span className={styles.mLabel}>Class:</span>
                      <span className={styles.mValue}>Yr {sub.student_year}, Sem {sub.student_sem}, Sec {sub.student_section}</span>
                    </div>
                    <div className={styles.mInfoRow}>
                      <span className={styles.mLabel}>Submitted:</span>
                      <span className={styles.mValue}>{formatDate(sub.submitted_at)}</span>
                    </div>
                  </div>

                  {!isEditing && (
                    <div className={styles.mEvalBody}>
                      {sub.marks_obtained !== null && sub.marks_obtained !== undefined ? (
                        <div className={styles.mMarksRow}>
                          <span className={styles.mLabel}>Marks:</span>
                          <span className={styles.marksBadge}>{sub.marks_obtained}</span>
                        </div>
                      ) : null}
                      {sub.feedback && (
                        <div className={styles.mFeedbackRow}>
                          <span className={styles.mLabel}>Feedback:</span>
                          <p className={styles.mFeedbackText}>"{sub.feedback}"</p>
                        </div>
                      )}
                    </div>
                  )}

                  {isEditing && (
                    <div className={styles.mEditSection}>
                      <div className={styles.mEditRow}>
                        <div className={styles.evalInputGroup}>
                          <label>Marks</label>
                          <input 
                            type="number" 
                            className={styles.evalInput}
                            value={evalData.marks_obtained}
                            onChange={(e) => setEvalData({...evalData, marks_obtained: e.target.value})}
                          />
                        </div>
                        <div className={styles.evalInputGroup}>
                          <label>Status</label>
                          <select 
                            className={styles.evalSelect}
                            value={evalData.status}
                            onChange={(e) => setEvalData({...evalData, status: e.target.value})}
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="late">Late</option>
                          </select>
                        </div>
                      </div>
                      <div className={styles.evalInputGroupFull}>
                        <label>Feedback</label>
                        <textarea 
                          className={styles.evalTextarea}
                          rows="3"
                          value={evalData.feedback}
                          onChange={(e) => setEvalData({...evalData, feedback: e.target.value})}
                        ></textarea>
                      </div>
                    </div>
                  )}

                  
                  <div className={styles.mCardFooter}>
                    <a
                      href={sub.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`btn-outline ${styles.mFullBtn}`}
                    >
                      <Download size={18} /> Document
                    </a>
                  </div>

                  <div className={styles.mCardActions}>
                    {isEditing ? (
                      <div className={styles.mActionButtons}>
                        <button 
                          onClick={handleCancelEdit}
                          className={`btn-secondary ${styles.mCancelBtn}`}
                          disabled={isSaving}
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleSaveEvaluation(sub.id)}
                          className={`btn-primary ${styles.mSaveBtn}`}
                          disabled={isSaving}
                        >
                          {isSaving ? 'Saving...' : 'Save Evaluation'}
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleEditClick(sub)}
                        className={`btn-primary ${styles.mFullBtn} ${styles.mEvalBtn}`}
                      >
                        <Edit2 size={18} /> Evaluate
                      </button>
                    )}
                  </div>
                </div>
                );
              })
            ) : (
              <div className={styles.noResults}>No students found matching "{searchQuery}"</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FacultySubmissionReview;
