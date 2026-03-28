import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import logo from '../../assets/iilm-logo.png';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.navLogo}>
          <img src={logo} alt="IILM Logo" className={styles.logoImage} />
          <span className={styles.logoText}>AssignFlow</span>
        </Link>
        <div className={styles.navLinks}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={styles.navLink}>Dashboard</Link>
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

export default Navbar;

