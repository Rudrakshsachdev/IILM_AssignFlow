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
  Loader
} from 'lucide-react';
import api from '../../api/axiosConfig';
import styles from './FacultySubmissionReview.module.css';
import SubmissionReviewModal from './components/SubmissionReviewModal';

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
  const [selectedSubmission, setSelectedSubmission] = useState(null);
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
    setSelectedSubmission(sub);
  };

  const handleCloseModal = () => {
    setSelectedSubmission(null);
    setSuccessMsg(null);
    setError(null);
  };

  const handleSaveEvaluation = async (subId, newEvalData) => {
    try {
      setSavingId(subId);
      setError(null);
      setSuccessMsg(null);

      const payload = {
        marks_obtained: newEvalData.marks_obtained,
        feedback: newEvalData.feedback,
        status: newEvalData.status
      };

      const res = await api.put(`/faculty/submissions/${subId}/evaluate`, payload);

      setSuccessMsg('Evaluation saved successfully!');
      
      // Close modal gracefully after success
      setTimeout(() => {
        setSuccessMsg(null);
        setSelectedSubmission(null);
      }, 1500);
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
                    return (
                    <tr key={sub.id}>
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
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button 
                            onClick={() => handleEditClick(sub)} 
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                          >
                            <Edit2 size={18} />
                            <span>Evaluate</span>
                          </button>
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
                return (
                <div key={sub.id} className={`glass-card ${styles.mobileCard}`}>
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

                  <div className={styles.mCardActions}>
                    <button 
                      onClick={() => handleEditClick(sub)}
                      className={`btn-primary ${styles.mFullBtn} ${styles.mEvalBtn}`}
                    >
                      <Edit2 size={18} /> Open Evaluation Modal
                    </button>
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

      {selectedSubmission && (
        <SubmissionReviewModal
          submission={selectedSubmission}
          assignment={assignment}
          onClose={handleCloseModal}
          onSave={handleSaveEvaluation}
          isSaving={savingId === selectedSubmission.id}
          successMsg={successMsg}
          errorMsg={error}
        />
      )}
    </div>
  );
};

export default FacultySubmissionReview;
