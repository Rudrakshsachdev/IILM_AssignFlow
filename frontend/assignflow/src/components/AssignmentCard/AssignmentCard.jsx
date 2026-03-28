import React from 'react';
import { BookOpen, Trophy, Calendar, Clock, Paperclip, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './AssignmentCard.module.css';

const AssignmentCard = ({ assignment, onEdit, onDelete, isStudentView = false }) => {
  const navigate = useNavigate();
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

  const isDeadlinePassed = new Date(assignment.deadline) < new Date();

  const getStatusClass = (status) => {
    if (isStudentView) {
      switch (status?.toLowerCase()) {
        case 'submitted': return styles.statusSubmitted;
        case 'late': return styles.statusLate;
        case 'pending': return styles.statusPending;
        default: return styles.statusPending;
      }
    }

    switch (status) {
      case 'published': return styles.statusPublished;
      case 'draft': return styles.statusDraft;
      case 'closed': return styles.statusClosed;
      default: return styles.statusPublished;
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${assignment.title}"? This cannot be undone.`)) {
      onDelete(assignment.id);
    }
  };

  return (
    <div className={`glass-card ${styles.card}`}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{assignment.title}</h3>
        <span className={`${styles.statusBadge} ${getStatusClass(isStudentView ? assignment.submissionStatus : assignment.status)}`}>
          {isStudentView ? (assignment.submissionStatus || 'Pending') : assignment.status}
        </span>
      </div>

      {assignment.description && (
        <p className={styles.cardDescription}>{assignment.description}</p>
      )}

      <div className={styles.cardMeta}>
        <div className={styles.metaItem}>
          <BookOpen className={styles.metaIcon} size={16} />
          <span className={styles.metaLabel}>{assignment.subject}</span>
        </div>
        <div className={styles.metaItem}>
          <Trophy className={styles.metaIcon} size={16} />
          <span>{assignment.max_marks} marks</span>
        </div>
        <div className={styles.metaItem}>
          <Calendar className={styles.metaIcon} size={16} />
          <span className={isDeadlinePassed ? styles.deadlinePassed : ''}>
            {formatDate(assignment.deadline)}
            {isDeadlinePassed && ' (Past)'}
          </span>
        </div>
        <div className={styles.metaItem}>
          <Clock className={styles.metaIcon} size={16} />
          <span>Created {formatDate(assignment.created_at)}</span>
        </div>
      </div>

      {assignment.file_url && (
        <a
          href={assignment.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.fileLink}
        >
          <Paperclip size={16} style={{ marginRight: '0.4rem' }} /> View Attachment
        </a>
      )}

      {isStudentView ? (
        <div className={styles.cardActions}>
          <button 
            className="btn-primary" 
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => navigate(`/student-dashboard/assignment/${assignment.id}`)}
          >
            View Details <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className={styles.cardActions}>
          <button className="btn-secondary" onClick={() => onEdit(assignment)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Edit2 size={16} /> Edit
          </button>
          <button className="btn-secondary" onClick={handleDelete} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#dc2626', borderColor: '#fecaca' }}>
            <Trash2 size={16} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default AssignmentCard;
