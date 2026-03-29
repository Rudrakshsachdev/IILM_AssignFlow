import React from 'react';
import { motion } from 'framer-motion';
import styles from '../StudentDashboard.module.css';

const StatCard = ({ title, value, icon: Icon, subtitle, color, delay }) => {
  return (
    <motion.div 
      className={`glass-card ${styles.statCardModule}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
      whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
    >
      <div className={styles.statIconWrapper} style={{ backgroundColor: `${color}15` }}>
        <Icon size={24} color={color} />
      </div>
      <div className={styles.statContent}>
        <h3 className={styles.statValue}>{value}</h3>
        <p className={styles.statTitle}>{title}</p>
        {subtitle && <p className={styles.statSubtitle}>{subtitle}</p>}
      </div>
    </motion.div>
  );
};

export default StatCard;
