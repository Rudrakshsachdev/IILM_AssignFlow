import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Unauthorized.module.css';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.flexContainer}>
      <div className={`glass-card ${styles.unauthorizedCard}`}>
        <h1 className={styles.title}>403</h1>
        <h2 className={styles.subtitle}>Access Denied</h2>
        <p className="text-muted">You do not have the necessary permissions to view this page.</p>
        <button className="btn-primary" onClick={() => navigate(-1)} style={{marginTop: '2rem'}}>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
