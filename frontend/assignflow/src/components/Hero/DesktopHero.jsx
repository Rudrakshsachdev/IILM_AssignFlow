import React from 'react';
import { Link } from 'react-router-dom';
import styles from './DesktopHero.module.css';

const DesktopHero = () => {
  return (
    <div className={styles.heroSection}>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>Streamline Your Academic Workflow</h1>
        <p className={styles.heroSubtitle}>AssignFlow connects students and faculty with an intuitive assignment management system. Experience the future of education with IILM.</p>
        <div className={styles.heroButtons}>
          <Link to="/signup" className="btn-primary btn-large">Join Now</Link>
          <Link to="/login" className="btn-secondary btn-large">Login</Link>
        </div>
      </div>
      <div className={styles.heroVisual}>
        <div className={`glass-card ${styles.decorativeCard1}`}>
           <h3>Manage Assignments</h3>
           <div className="skeleton-line"></div>
           <div className="skeleton-line short"></div>
        </div>
        <div className={`glass-card ${styles.decorativeCard2}`}>
           <h3>Track Progress</h3>
           <div className="progress-bar"><div className="progress-fill"></div></div>
        </div>
      </div>
    </div>
  );
};
export default DesktopHero;
