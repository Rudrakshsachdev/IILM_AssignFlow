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
  const profilePath = user?.role === 'student' ? '/student-dashboard/profile' : '/faculty-dashboard/profile';

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
                <Link to={profilePath} className={styles.navLink} onClick={closeMenu}>Profile</Link>
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
