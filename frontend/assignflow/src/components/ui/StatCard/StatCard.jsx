import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import styles from './StatCard.module.css';

const CountUp = ({ to, suffix = "" }) => {
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-100px" });
  
  // Extract number from string (e.g., "1000+" -> 1000)
  const numericValue = parseInt(to.replace(/[^\d]/g, ''), 10) || 0;
  
  const count = useMotionValue(0);
  
  // Create a spring for smooth counting
  const springValue = useSpring(count, {
    damping: 30,
    stiffness: 100,
  });

  useEffect(() => {
    if (isInView) {
      count.set(numericValue);
    }
  }, [isInView, numericValue, count]);

  useEffect(() => {
    // Listen to changes in springValue and update the DOM manually
    return springValue.on("change", (latest) => {
      if (nodeRef.current) {
        nodeRef.current.textContent = Math.round(latest);
      }
    });
  }, [springValue]);

  return (
    <span>
      <span ref={nodeRef}>0</span>
      {suffix}
    </span>
  );
};


const StatCard = ({ value, label, iconName, index }) => {
  const Icon = LucideIcons[iconName] || LucideIcons.Activity;
  
  // Determine if there's a suffix like "+" or "%"
  const suffix = value.replace(/[\d]/g, '');

  return (
    <motion.div 
      className={styles.statCard}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <div className={styles.iconCircle}>
        <Icon size={24} />
      </div>
      <div className={styles.value}>
         <CountUp to={value} suffix={suffix} />
      </div>
      <p className={styles.label}>{label}</p>
    </motion.div>
  );
};

export default StatCard;
