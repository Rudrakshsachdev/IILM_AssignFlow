import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import styles from './StepItem.module.css';

const StepItem = ({ number, title, description, iconName, index, isLast }) => {
  const Icon = LucideIcons[iconName] || LucideIcons.Circle;

  return (
    <motion.div 
      className={styles.stepItem}
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2, duration: 0.6 }}
    >
      <div className={styles.visualColumn}>
        <div className={styles.iconCircle}>
          <Icon className={styles.icon} size={24} />
          <div className={styles.numberBadge}>{number}</div>
        </div>
        {!isLast && <div className={styles.connectorLine}></div>}
      </div>

      <div className={styles.contentColumn}>
        <h3 className={styles.stepTitle}>{title}</h3>
        <p className={styles.stepDescription}>{description}</p>
      </div>
    </motion.div>
  );
};

export default StepItem;
