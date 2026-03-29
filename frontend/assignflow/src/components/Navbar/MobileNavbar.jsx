import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Menu, X } from 'lucide-react';
import logo from '../../assets/iilm-logo.png';
import styles from './MobileNavbar.module.css';

const MobileNavbar = () => {
  const { isAuthenticated, logout, user } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const closeMenu = () => setIsOpen(false);

  const dashboardPath = user?.role === 'student' ? '/student-dashboard' : (user?.role === 'faculty' ? '/faculty-dashboard' : (user?.role === 'admin' ? '/admin-dashboard' : '/'));
  const profilePath = user?.role === 'student' ? '/student-dashboard/profile' : (user?.role === 'faculty' ? '/faculty-dashboard/profile' : null);
  const assignmentsPath = user?.role === 'faculty' ? '/faculty-dashboard/create-assignment' : (user?.role === 'student' ? '/student-dashboard/assignments' : null);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.navLogo} onClick={closeMenu}>
          <img src={logo} alt="IILM Logo" className={styles.logoImage} />
        </Link>
        <button className={styles.menuButton} onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isOpen && (
        <div className={styles.mobileMenuContainer}>
          <div className={styles.mobileMenu}>
            {isAuthenticated ? (
              <>
                <Link to={dashboardPath} className={styles.navLink} onClick={closeMenu}>Dashboard</Link>
                {assignmentsPath && <Link to={assignmentsPath} className={styles.navLink} onClick={closeMenu}>Assignments</Link>}
                {profilePath && <Link to={profilePath} className={styles.navLink} onClick={closeMenu}>Profile</Link>}
                {user?.role === 'admin' && (
                  <>
                    <Link to="/admin-dashboard?tab=overview" className={styles.navLink} onClick={closeMenu}>System Overview</Link>
                    <Link to="/admin-dashboard?tab=mappings" className={styles.navLink} onClick={closeMenu}>Faculty Mappings</Link>
                    <Link to="/admin-dashboard?tab=submissions" className={styles.navLink} onClick={closeMenu}>Student Submissions</Link>
                    <Link to="/admin-dashboard?tab=assignments" className={styles.navLink} onClick={closeMenu}>Faculty Assignments</Link>
                    <Link to="/admin-dashboard?tab=whitelist" className={styles.navLink} onClick={closeMenu}>User Whitelist</Link>
                    <Link to="/admin-dashboard?tab=tools" className={styles.navLink} onClick={closeMenu}>System Tools</Link>
                  </>
                )}
                <button onClick={handleLogout} className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.navLink} onClick={closeMenu}>Login</Link>
                <Link to="/signup" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={closeMenu}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default MobileNavbar;
