import React from 'react';
import { motion } from 'framer-motion';
import ComparisonRow from '../../ui/ComparisonRow/ComparisonRow';
import styles from './ComparisonSection.module.css';

const comparisonData = [
  {
    feature: "Assignment Tracking",
    traditional: "Manual tracking using emails or spreadsheets",
    assignflow: "Centralized dashboard with real-time tracking",
  },
  {
    feature: "Submission Process",
    traditional: "Scattered submissions via email or offline",
    assignflow: "Single-click digital submission with file upload",
  },
  {
    feature: "Deadline Management",
    traditional: "No reminders, easy to miss deadlines",
    assignflow: "Automated reminders and notifications",
  },
  {
    feature: "Data Organization",
    traditional: "Unstructured and hard to manage",
    assignflow: "Well-organized and searchable data",
  },
  {
    feature: "Role Management",
    traditional: "No clear separation of roles",
    assignflow: "Dedicated dashboards for students, faculty, and admin",
  },
  {
    feature: "Accessibility",
    traditional: "Limited access and visibility",
    assignflow: "Accessible anytime with secure login",
  },
];

const ComparisonSection = () => {
  return (
    <section className={styles.section} id="comparison">
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.label}>Old vs New</span>
          <h2 className={styles.title}>Traditional Systems vs AssignFlow</h2>
          <p className={styles.subtitle}>
            See how AssignFlow transforms academic workflow efficiency by replacing manual pain points with structured digital solutions.
          </p>
        </motion.div>

        <div className={styles.tableWrapper}>
          <div className={styles.tableHeader}>
            <div className={styles.headerCell}>Feature</div>
            <div className={styles.headerCell}>Traditional System</div>
            <div className={`${styles.headerCell} ${styles.highlight}`}>AssignFlow</div>
          </div>
          <div className={styles.tableBody}>
            {comparisonData.map((data, index) => (
              <ComparisonRow 
                key={index}
                index={index}
                {...data}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
