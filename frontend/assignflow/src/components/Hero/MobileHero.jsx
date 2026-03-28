import React from 'react';
import { Link } from 'react-router-dom';
import styles from './MobileHero.module.css';

const MobileHero = () => {
  return (
    <div className={styles.heroSection}>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>Academic Workflow<br/>Simplified.</h1>
        <p className={styles.heroSubtitle}>
          AssignFlow connects students and faculty with an intuitive assignment management system on the go.
        </p>
        <div className={styles.heroButtons}>
          <Link to="/signup" className="btn-primary btn-large">Get Started Free</Link>
          <Link to="/login" className="btn-secondary btn-large">Log In</Link>
        </div>
      </div>
      <div className={styles.heroVisual}>
        <div className={`glass-card ${styles.mobileCard}`}>
           <div className={styles.statBadge}>Active Now</div>
           <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Your Tasks</h3>
           <div className="skeleton-line"></div>
           <div className="skeleton-line short"></div>
           <div className="progress-bar" style={{ marginTop: '1.5rem' }}>
             <div className="progress-fill" style={{ width: '85%' }}></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MobileHero;
