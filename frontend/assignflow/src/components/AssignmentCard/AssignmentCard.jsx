import React from 'react';
import styles from './AssignmentCard.module.css';

const AssignmentCard = ({ assignment, onEdit, onDelete }) => {
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
        <span className={`${styles.statusBadge} ${getStatusClass(assignment.status)}`}>
          {assignment.status}
        </span>
      </div>

      {assignment.description && (
        <p className={styles.cardDescription}>{assignment.description}</p>
      )}

      <div className={styles.cardMeta}>
        <div className={styles.metaItem}>
          <span className={styles.metaIcon}>📚</span>
          <span className={styles.metaLabel}>{assignment.subject}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaIcon}>🏆</span>
          <span>{assignment.max_marks} marks</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaIcon}>📅</span>
          <span className={isDeadlinePassed ? styles.deadlinePassed : ''}>
            {formatDate(assignment.deadline)}
            {isDeadlinePassed && ' (Past)'}
          </span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaIcon}>🕐</span>
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
          📎 View Attachment
        </a>
      )}

      <div className={styles.cardActions}>
        <button className="btn-secondary" onClick={() => onEdit(assignment)}>
          ✏️ Edit
        </button>
        <button className="btn-secondary" onClick={handleDelete} style={{ color: '#dc2626', borderColor: '#fecaca' }}>
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default AssignmentCard;
