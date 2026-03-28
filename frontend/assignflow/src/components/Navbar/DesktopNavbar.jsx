import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import logo from '../../assets/iilm-logo.png';
import styles from './DesktopNavbar.module.css';

const DesktopNavbar = () => {
  const { isAuthenticated, logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardPath = user?.role === 'student' ? '/student-dashboard' : (user?.role === 'faculty' ? '/faculty-dashboard' : (user?.role === 'admin' ? '/admin-dashboard' : '/'));
  const profilePath = user?.role === 'student' ? '/student-dashboard/profile' : (user?.role === 'faculty' ? '/faculty-dashboard/profile' : null);
  const assignmentsPath = user?.role === 'faculty' ? '/faculty-dashboard/create-assignment' : (user?.role === 'student' ? '/student-dashboard/assignments' : null);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.navLogo}>
          <img src={logo} alt="IILM Logo" className={styles.logoImage} />
          <span className={styles.logoSeparator}>×</span>
          <span className={styles.logoText}>AssignFlow</span>
        </Link>
        <div className={styles.navLinks}>
          {isAuthenticated ? (
            <>
              <Link to={dashboardPath} className={styles.navLink}>Dashboard</Link>
              {assignmentsPath && <Link to={assignmentsPath} className={styles.navLink}>Assignments</Link>}
              {profilePath && <Link to={profilePath} className={styles.navLink}>Profile</Link>}
              <button onClick={handleLogout} className="btn-primary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.navLink}>Login</Link>
              <Link to="/signup" className="btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default DesktopNavbar;
