import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import styles from './Profile.module.css'; // Reusing profile styles

const FacultyProfile = () => {
  const { user } = useAuthStore();

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1>Faculty Profile</h1>
      </div>
      
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className={styles.avatarPlaceholder} style={{ margin: '0 auto 1.5rem' }}>
          {user?.email?.[0].toUpperCase() || 'F'}
        </div>
        <h2>{user?.email}</h2>
        <span className={styles.badge} style={{ background: 'rgba(157, 34, 45, 0.1)', color: '#9d222d' }}>
          Faculty Member
        </span>
        
        <div style={{ marginTop: '2rem', color: 'var(--text-muted)' }}>
          <p>The faculty profile management system is currently under development.</p>
          <p>Soon you will be able to manage your courses, assignments, and professional details here.</p>
        </div>
      </div>
    </div>
  );
};

export default FacultyProfile;
