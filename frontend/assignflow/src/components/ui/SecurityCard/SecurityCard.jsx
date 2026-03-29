import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import styles from './SecurityCard.module.css';

const SecurityCard = ({ title, description, icon, index, isHighlight }) => {
  // Dynamically resolve the icon component from Lucide
  const Icon = LucideIcons[icon] || LucideIcons.Shield;

  return (
    <motion.div 
      className={`${styles.card} ${isHighlight ? styles.highlight : ''}`}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -5 }}
    >
      <div className={styles.iconWrapper}>
        <Icon className={styles.icon} size={28} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {isHighlight && <div className={styles.badge}>Priority Protection</div>}
    </motion.div>
  );
};

export default SecurityCard;
