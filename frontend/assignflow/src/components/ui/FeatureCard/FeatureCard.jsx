import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import styles from './FeatureCard.module.css';

const FeatureCard = ({ title, description, iconName, index }) => {
  // Dynamically resolve the icon component from Lucide
  const Icon = LucideIcons[iconName] || LucideIcons.HelpCircle;

  return (
    <motion.div 
      className={`glass-card ${styles.card}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <div className={styles.iconWrapper}>
        <Icon className={styles.icon} size={28} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
