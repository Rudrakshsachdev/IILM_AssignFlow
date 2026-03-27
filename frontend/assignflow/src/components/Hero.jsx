import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Streamline Your Academic Workflow</h1>
        <p className="hero-subtitle">AssignFlow connects students and faculty with an intuitive assignment management system. Experience the future of education with IILM.</p>
        <div className="hero-buttons">
          <Link to="/signup" className="btn-primary btn-large">Get Started</Link>
          <Link to="/login" className="btn-secondary btn-large">Login</Link>
        </div>
      </div>
      <div className="hero-visual">
        <div className="glass-card decorative-card1">
           <h3>Manage Assignments</h3>
           <div className="skeleton-line"></div>
           <div className="skeleton-line short"></div>
        </div>
        <div className="glass-card decorative-card2">
           <h3>Track Progress</h3>
           <div className="progress-bar"><div className="progress-fill"></div></div>
        </div>
      </div>
    </div>
  );
};
export default Hero;
