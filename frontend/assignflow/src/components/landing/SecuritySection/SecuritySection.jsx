import React from 'react';
import { motion } from 'framer-motion';
import SecurityCard from '../../ui/SecurityCard/SecurityCard';
import styles from './SecuritySection.module.css';

const securityPoints = [
  {
    title: "Restricted Access Control",
    description: "Only authorized users from the institution can access the platform via a secure whitelist system.",
    icon: "ShieldCheck",
    isHighlight: true,
  },
  {
    title: "Role-Based Authorization",
    description: "Students, faculty, and admins have controlled access based on their roles.",
    icon: "Users",
  },
  {
    title: "Secure Authentication",
    description: "JWT-based authentication ensures safe and verified access to the platform.",
    icon: "Lock",
  },
  {
    title: "Protected Data Handling",
    description: "Sensitive academic data is securely managed and never exposed to unauthorized users.",
    icon: "Database",
  },
  {
    title: "Cloud File Security",
    description: "Uploaded documents are securely stored using trusted cloud services.",
    icon: "Cloud",
  },
  {
    title: "Privacy First Approach",
    description: "User data is strictly used for academic purposes and not shared externally.",
    icon: "EyeOff",
  },
];

const SecuritySection = () => {
  return (
    <section className={styles.section} id="security">
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.label}>Ironclad Protection</span>
          <h2 className={styles.title}>Security & Privacy You Can Trust</h2>
          <p className={styles.subtitle}>
            We prioritize the safety of your data and ensure secure access at every level with institutional-grade protection.
          </p>
        </motion.div>

        <div className={styles.grid}>
          {securityPoints.map((point, index) => (
            <SecurityCard 
              key={index}
              index={index}
              {...point}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
