import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import styles from './WhyCard.module.css';

const WhyCard = ({ title, description, icon, index, isFeatured }) => {
  // Dynamically resolve the icon component from Lucide
  const Icon = LucideIcons[icon] || LucideIcons.HelpCircle;

  return (
    <motion.div 
      className={`glass-card ${styles.card} ${isFeatured ? styles.featured : ''}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <div className={styles.iconWrapper}>
        <Icon className={styles.icon} size={32} />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
      {isFeatured && <div className={styles.badge}>Most Valued</div>}
    </motion.div>
  );
};

export default WhyCard;
