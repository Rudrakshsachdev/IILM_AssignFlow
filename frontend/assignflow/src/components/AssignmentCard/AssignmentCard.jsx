import React from 'react';
import { BookOpen, Trophy, Calendar, Clock, Paperclip, Edit2, Trash2 } from 'lucide-react';
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

      <div className={styles.cardActions}>
        <button className="btn-secondary" onClick={() => onEdit(assignment)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Edit2 size={16} /> Edit
        </button>
        <button className="btn-secondary" onClick={handleDelete} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#dc2626', borderColor: '#fecaca' }}>
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </div>
  );
};

export default AssignmentCard;
