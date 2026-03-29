import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Download, FileText, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import styles from './StudentSubmissions.module.css';

const StudentSubmissions = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/student/submissions');
      setSubmissions(res.data);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions. Please try again.');
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

  const filteredSubmissions = submissions.filter((sub) => {
    const query = searchQuery.toLowerCase();
    return (
      (sub.assignment_title && sub.assignment_title.toLowerCase().includes(query)) ||
      (sub.subject && sub.subject.toLowerCase().includes(query))
    );
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate('/student-dashboard')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={styles.pageTitle}>My Submissions</h1>
            <p className={styles.pageSubtitle}>View your assignment submissions and evaluations</p>
          </div>
        </div>

        <div className={styles.statsCard}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{submissions.length}</span>
            <span className={styles.statLabel}>Total Submitted</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>
              {submissions.filter(s => s.status?.toLowerCase() === 'reviewed').length}
            </span>
            <span className={styles.statLabel}>Evaluated</span>
          </div>
        </div>
      </header>

      <div className={styles.controlsSection}>
        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by title or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading your submissions...</p>
        </div>
      ) : error ? (
        <div className={styles.errorState}>
          <AlertCircle size={40} className={styles.errorIcon} />
          <p>{error}</p>
          <button onClick={fetchSubmissions} className="btn-primary" style={{marginTop: '1rem'}}>Retry</button>
        </div>
      ) : submissions.length === 0 ? (
        <div className={styles.emptyState}>
          <FileText size={48} className={styles.emptyIcon} />
          <h3>No submissions yet.</h3>
          <p>When you submit an assignment, it will appear here.</p>
          <button onClick={() => navigate('/student-dashboard/assignments')} className="btn-primary" style={{marginTop: '1rem'}}>
            View Assignments
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className={styles.tableWrapper}>
            <table className={styles.submissionsTable}>
              <thead>
                <tr>
                  <th>Assignment Details</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                  <th>Evaluation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <div className={styles.assignmentInfo}>
                          <div className={styles.assignmentIcon}>
                            <BookOpen size={18} />
                          </div>
                          <div>
                            <div className={styles.assignmentTitle}>{sub.assignment_title}</div>
                            <div className={styles.assignmentSubject}>{sub.subject}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.timeInfo}>
                          <Clock size={16} />
                          {formatDate(sub.submitted_at)}
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusClass(sub.status)}`}>
                          {sub.status || 'Submitted'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.evaluationDisplay}>
                          {sub.marks_obtained !== null && sub.marks_obtained !== undefined ? (
                            <span className={styles.marksText}>{sub.marks_obtained} Pts</span>
                          ) : (
                            <span className={styles.notGradedText}>Not graded yet</span>
                          )}
                          {sub.feedback && (
                            <div className={styles.feedbackTooltipWrap}>
                              <span className={styles.feedbackPreview}>"{sub.feedback.substring(0, 30)}{sub.feedback.length > 30 ? '...' : ''}"</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <a
                            href={sub.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.actionBtn}
                            title="View Submitted Document"
                          >
                            <Download size={18} />
                            <span>View File</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className={styles.noResults}>
                      No submissions found matching "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className={styles.mobileCardsList}>
            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((sub) => (
                <div key={sub.id} className={`glass-card ${styles.mobileCard}`}>
                  <div className={styles.mCardHeader}>
                    <h3 className={styles.mAssignmentTitle}>{sub.assignment_title}</h3>
                    <span className={`${styles.statusBadge} ${getStatusClass(sub.status)}`}>
                      {sub.status || 'Pending'}
                    </span>
                  </div>
                  
                  <div className={styles.mCardBody}>
                    <div className={styles.mInfoRow}>
                      <span className={styles.mLabel}>Subject:</span>
                      <span className={styles.mValue}>{sub.subject}</span>
                    </div>
                    <div className={styles.mInfoRow}>
                      <span className={styles.mLabel}>Submitted:</span>
                      <span className={styles.mValue}>{formatDate(sub.submitted_at)}</span>
                    </div>
                    {sub.evaluated_at && (
                      <div className={styles.mInfoRow}>
                        <span className={styles.mLabel}>Evaluated:</span>
                        <span className={styles.mValue}>{formatDate(sub.evaluated_at)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.mEvalSection}>
                    {sub.marks_obtained !== null && sub.marks_obtained !== undefined ? (
                      <div className={styles.mMarksRow}>
                        <span className={styles.mLabelMarks}>Marks Obtained:</span>
                        <span className={styles.mMarksValue}>{sub.marks_obtained}</span>
                      </div>
                    ) : (
                      <div className={styles.mNotGraded}>Evaluation is pending</div>
                    )}
                    
                    {sub.feedback && (
                      <div className={styles.mFeedbackBox}>
                        <div className={styles.mFeedbackLabel}>Feedback:</div>
                        <p>"{sub.feedback}"</p>
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.mCardFooter}>
                    <a
                      href={sub.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`btn-primary ${styles.mFullBtn}`}
                    >
                      <FileText size={18} /> View Submitted Document
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noResults}>No submissions found matching "{searchQuery}"</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentSubmissions;
