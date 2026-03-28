import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import styles from './TestimonialCard.module.css';

const TestimonialCard = ({ name, role, feedback, index }) => {
  // Generate initials from name (handle Dr. and other titles)
  const getInitials = (name) => {
    const parts = name.split(' ').filter(p => !p.includes('.')); // Remove titles like Dr.
    if (parts.length === 0) return name.charAt(0).toUpperCase();
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <motion.div 
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <div className={styles.header}>
        <div className={styles.avatar}>
           {getInitials(name)}
        </div>
        <div className={styles.info}>
          <h4 className={styles.name}>{name}</h4>
          <span className={styles.role}>{role}</span>
        </div>
      </div>
      
      <div className={styles.rating}>
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} fill="currentColor" stroke="none" />
        ))}
      </div>

      <p className={styles.feedback}>“{feedback}”</p>
    </motion.div>
  );
};

export default TestimonialCard;
