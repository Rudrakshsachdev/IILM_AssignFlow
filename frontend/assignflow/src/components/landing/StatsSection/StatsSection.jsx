import React from 'react';
import { motion } from 'framer-motion';
import StatCard from '../../ui/StatCard/StatCard';
import styles from './StatsSection.module.css';

const stats = [
  {
    value: "1000+",
    label: "Assignments Managed",
    iconName: "FileCheck",
  },
  {
    value: "500+",
    label: "Students Connected",
    iconName: "Users",
  },
  {
    value: "50+",
    label: "Faculty Members",
    iconName: "UserCog",
  },
  {
    value: "95%",
    label: "On-Time Submissions",
    iconName: "TrendingUp",
  },
];

const StatsSection = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.label}>Platform Impact</span>
          <h2 className={styles.title}>Our Numbers Speak for Themselves</h2>
          <p className={styles.subtitle}>
            AssignFlow is already making a difference in classrooms, streamlining 
            workflows and boosting academic efficiency.
          </p>
        </motion.div>

        <motion.div 
          className={styles.grid}

          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {stats.map((stat, index) => (
            <StatCard 
              key={index}
              index={index}
              {...stat}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
