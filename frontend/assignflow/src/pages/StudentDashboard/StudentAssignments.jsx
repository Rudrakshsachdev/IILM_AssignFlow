import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';
import { getStudentAssignments } from '../../api/assignment';
import { getMySubmissions } from '../../api/submission';
import AssignmentCard from '../../components/AssignmentCard/AssignmentCard';
import styles from './StudentDashboard.module.css'; // using the same dashboard css module

const StudentAssignments = () => {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [assignmentsData, submissionsData] = await Promise.all([
        getStudentAssignments(),
        getMySubmissions()
      ]);

      // Merge submission status into assignments
      const merged = assignmentsData.map(assignment => {
        const submission = submissionsData.find(sub => sub.assignment_id === assignment.id);
        return {
          ...assignment,
          submissionStatus: submission ? submission.status : 'Pending'
        };
      });

      setAssignments(merged);
    } catch (err) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        setErrorMsg('Failed to load assignments.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return (
    <div className={styles.dashboardContainer} style={{ paddingTop: '2rem' }}>
      <button className="btn-secondary" onClick={() => navigate('/student-dashboard')} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className={styles.sectionHeader} style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.8rem', color: 'var(--secondary-color)' }}>
          <FileText size={28} color="var(--primary-color)" /> My Assignments
        </h2>
        <p className="text-muted" style={{ marginTop: '0.5rem' }}>View your pending and completed coursework.</p>
      </div>

      {errorMsg && <div className="errorMsg" style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{errorMsg}</div>}

      {loading ? (
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div className={`glass-card ${styles.card}`} style={{ flex: 1, minWidth: '300px' }}>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short" style={{ marginTop: '1rem' }}></div>
          </div>
          <div className={`glass-card ${styles.card}`} style={{ flex: 1, minWidth: '300px' }}>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short" style={{ marginTop: '1rem' }}></div>
          </div>
        </div>
      ) : assignments.length === 0 ? (
        <div className={`glass-card ${styles.card}`} style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>You have no published assignments at the moment. Enjoy your free time!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {assignments.map(assignment => (
            <AssignmentCard 
              key={assignment.id} 
              assignment={assignment} 
              isStudentView={true} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;
