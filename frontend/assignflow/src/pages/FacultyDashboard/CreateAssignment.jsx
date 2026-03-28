import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAssignment } from '../../api/assignment';
import AssignmentForm from '../../components/AssignmentForm/AssignmentForm';
import styles from './FacultyDashboard.module.css';

const CreateAssignment = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreate = async (formData) => {
    setSubmitting(true);
    try {
      await createAssignment(formData);
      navigate('/faculty-dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to create assignment.');
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <h1>Create Assignment</h1>
          <p>Publish a new assignment for students</p>
        </div>
        <div className={styles.headerRight}>
          <button className="btn-secondary" onClick={() => navigate('/faculty-dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </header>

      {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

      <div style={{ marginTop: '2rem' }}>
        <AssignmentForm
          onSubmit={handleCreate}
          onCancel={() => navigate('/faculty-dashboard')}
          isLoading={submitting}
          inline={true}
        />
      </div>
    </div>
  );
};

export default CreateAssignment;
