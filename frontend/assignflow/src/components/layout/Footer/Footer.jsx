import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowUp } from 'lucide-react';
import styles from './Footer.module.css';

// Inline SVGs for brand icons removed from recent lucide-react versions
const GithubIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.24c3-.34 6-1.53 6-6.76a5.5 5.5 0 0 0-1.5-3.89C18.8 3.5 18 2 18 2s-1.5 0-3.5 1.5a13.3 13.3 0 0 0-7 0C5.5 2 4 2 4 2s-.8 1.5-.5 2.11A5.5 5.5 0 0 0 2 8c0 5.23 3 6.42 6 6.76a4.8 4.8 0 0 0-1 3.24v4"></path>
    <path d="M9 19c-4 1-5-2.5-7-3"></path>
  </svg>
);

const LinkedinIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const FooterColumn = ({ title, links }) => (
  <div className={styles.column}>
    <h4 className={styles.columnTitle}>{title}</h4>
    <ul className={styles.linkList}>
      {links.map((link, index) => (
        <li key={index} className={styles.linkItem}>
          <a href={link.href} className={styles.link}>
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { label: 'Home', href: '#' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Testimonials', href: '#testimonials' },
  ];

  const platformLinks = [
    { label: 'Student Dashboard', href: '/student-dashboard' },
    { label: 'Faculty Dashboard', href: '/faculty-dashboard' },
    { label: 'Admin Panel', href: '/admin' },
    { label: 'Assignments', href: '/assignments' },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brandingColumn}>
            <div className={styles.logo}>
              <span className={styles.logoText}>AssignFlow</span>
            </div>
            <p className={styles.description}>
              Simplifying academic workflows for students and educators through a clean, unified platform.
            </p>
            <div className={styles.socialLinks}>
              <a href="https://github.com" className={styles.socialIcon} aria-label="Github">
                <GithubIcon size={20} />
              </a>
              <a href="https://linkedin.com" className={styles.socialIcon} aria-label="LinkedIn">
                <LinkedinIcon size={20} />
              </a>
              <a href="mailto:contact@assignflow.com" className={styles.socialIcon} aria-label="Email">
                <Mail size={20} />
              </a>
            </div>
          </div>

          <FooterColumn title="Quick Links" links={quickLinks} />
          <FooterColumn title="Platform" links={platformLinks} />

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Contact</h4>
            <p className={styles.contactInfo}>
              Questions? Reach out to us at <br />
              <span className={styles.accentText}>contact@assignflow.com</span>
            </p>
            <button
              onClick={scrollToTop}
              className={styles.scrollBtn}
              aria-label="Scroll to top"
            >
              <ArrowUp size={20} />
            </button>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <div className={styles.divider}></div>
          <div className={styles.bottomContent}>
            <p className={styles.copyright}>
              © 2026 AssignFlow. All rights reserved.
            </p>
            <p className={styles.credits}>
              Built with <span className={styles.heart}>❤️</span> by <span className={styles.author}>Rudraksh</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
