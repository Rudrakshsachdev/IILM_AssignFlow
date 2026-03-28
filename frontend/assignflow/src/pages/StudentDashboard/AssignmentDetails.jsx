import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { getStudentAssignmentById } from '../../api/assignment';
import { submitAssignment, getMySubmissions } from '../../api/submission';
import SubmissionForm from '../../components/SubmissionForm/SubmissionForm';
import { Calendar, Clock, Trophy, BookOpen, Paperclip, ArrowLeft, CheckCircle } from 'lucide-react';
import styles from './AssignmentDetails.module.css';

const AssignmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [assignmentData, submissionsData] = await Promise.all([
        getStudentAssignmentById(id),
        getMySubmissions()
      ]);
      
      setAssignment(assignmentData);
      
      // Check if student has already submitted this assignment
      const existingSubmission = submissionsData.find(sub => sub.assignment_id === parseInt(id));
      if (existingSubmission) {
        setSubmission(existingSubmission);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Assignment not found or it is no longer available.');
      } else {
        setError('Failed to load assignment details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTurnIn = async (fileUrl) => {
    setSubmitting(true);
    setError('');
    try {
      const newSubmission = await submitAssignment({
        assignment_id: parseInt(id),
        file_url: fileUrl,
      });
      setSubmission(newSubmission);
      setSuccessMsg('Assignment submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.spinner}>
          <div className={styles.spinnerDot}></div>
          <div className={styles.spinnerDot}></div>
          <div className={styles.spinnerDot}></div>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className={styles.pageContainer}>
        <button className="btn-secondary" onClick={() => navigate('/student-dashboard')} style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div className={`glass-card ${styles.errorCard}`}>
          <h3>Oops!</h3>
          <p>{error || 'Assignment could not be loaded.'}</p>
        </div>
      </div>
    );
  }

  const isDeadlinePassed = new Date(assignment.deadline) < new Date();

  return (
    <div className={styles.pageContainer}>
      <button className="btn-secondary" onClick={() => navigate('/student-dashboard')} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start' }}>
        <ArrowLeft size={16} /> Dashboard
      </button>

      {successMsg && <div className={styles.successMsg}>{successMsg}</div>}
      {error && <div className={styles.errorMsg}>{error}</div>}

      <div className={styles.layoutGrid}>
        {/* Left Column: Assignment Details */}
        <div className={styles.mainContent}>
          <div className={`glass-card ${styles.detailsCard}`}>
            <div className={styles.header}>
              <div className={styles.badgeLabel}>
                <BookOpen size={16} /> {assignment.subject_name || assignment.subject}
              </div>
              {assignment.section_label && (
                <div className={styles.badgeLabel} style={{ marginLeft: '0.5rem', background: 'var(--secondary-color)', color: '#fff' }}>
                  {assignment.section_label}
                </div>
              )}
              <h1 className={styles.title}>{assignment.title}</h1>
              
              <div className={styles.metaInfo}>
                <div className={styles.metaItem}>
                  <Calendar size={18} className={styles.metaIcon} />
                  <div>
                    <span className={styles.metaLabel}>Due Data</span>
                    <span className={`${styles.metaValue} ${isDeadlinePassed ? styles.pastDue : ''}`}>
                      {formatDate(assignment.deadline)}
                      {isDeadlinePassed && !submission && ' (Overdue)'}
                    </span>
                  </div>
                </div>
                <div className={styles.metaItem}>
                  <Trophy size={18} className={styles.metaIcon} />
                  <div>
                    <span className={styles.metaLabel}>Points</span>
                    <span className={styles.metaValue}>{assignment.max_marks} marks</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.instructions}>
              <h3>Instructions</h3>
              {assignment.description ? (
                <div className={styles.descriptionText}>
                  {assignment.description.split('\n').map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No additional instructions provided for this assignment.</p>
              )}
            </div>

            {assignment.file_url && (
              <div className={styles.attachmentBox}>
                <h3>Reference Material</h3>
                <a
                  href={assignment.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.fileLink}
                >
                  <div className={styles.fileLinkIcon}><Paperclip size={20} /></div>
                  <div className={styles.fileLinkLabel}>View Attachment</div>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Submission Area */}
        <div className={styles.sideContent}>
          {submission ? (
            <div className={`glass-card ${styles.submissionStatusCard} ${submission.status === 'late' ? styles.statusLate : styles.statusSubmitted}`}>
              <div className={styles.statusHeader}>
                <CheckCircle size={28} className={styles.statusIcon} />
                <h3>{submission.status === 'late' ? 'Turned in late' : 'Turned in'}</h3>
              </div>
              <p className={styles.submittedAt}>
                <Clock size={16} /> {formatDate(submission.submitted_at)}
              </p>
              
              <div className={styles.submittedFileBox}>
                <p className={styles.metaLabel}>Your Work</p>
                <a
                  href={submission.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.fileLink}
                >
                  <Paperclip size={18} style={{marginRight: '0.5rem'}} /> View Submitted File
                </a>
              </div>
            </div>
          ) : (
            <SubmissionForm onSubmit={handleTurnIn} isLoading={submitting} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetails;
