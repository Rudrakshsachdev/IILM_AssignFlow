import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, CheckCircle2 } from 'lucide-react';
import styles from './ComparisonRow.module.css';

const ComparisonRow = ({ feature, traditional, assignflow, index }) => {
  return (
    <motion.div 
      className={styles.row}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <div className={styles.featureColumn}>
        <span className={styles.featureTitle}>{feature}</span>
      </div>
      
      <div className={styles.traditionalColumn}>
        <div className={styles.mobileLabel}>Traditional System</div>
        <div className={styles.content}>
          <XCircle className={styles.errorIcon} size={18} />
          <p>{traditional}</p>
        </div>
      </div>
      
      <div className={styles.assignflowColumn}>
        <div className={styles.mobileLabel}>AssignFlow</div>
        <div className={styles.content}>
          <CheckCircle2 className={styles.successIcon} size={18} />
          <p>{assignflow}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ComparisonRow;
