import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './CTASection.module.css';

const CTASection = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div 
          className={styles.card}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className={styles.content}>
            <h2 className={styles.title}>
              Start Managing Your Academic Workflow Today
            </h2>
            <p className={styles.subtitle}>
              Join AssignFlow and simplify assignments, tracking, and collaboration 
              for students and educators alike.
            </p>
            
            <div className={styles.btnGroup}>
              <Link to="/signup" className={styles.primaryBtn}>
                Get Started
              </Link>
              <Link to="/signup?role=faculty" className={styles.secondaryBtn}>
                Join as Faculty
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
