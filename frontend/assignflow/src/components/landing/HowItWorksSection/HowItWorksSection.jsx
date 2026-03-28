import React from 'react';
import { motion } from 'framer-motion';
import StepItem from '../../ui/StepItem/StepItem';
import styles from './HowItWorksSection.module.css';

const steps = [
  {
    number: "01",
    title: "Sign Up",
    description: "Register as a student or faculty member to get started.",
    iconName: "UserPlus",
  },
  {
    number: "02",
    title: "Create or Join Courses",
    description: "Students join courses while faculty create and manage them.",
    iconName: "BookOpen",
  },
  {
    number: "03",
    number: "03",
    title: "Upload / Assign Work",
    description: "Faculty assign tasks and students submit their work easily.",
    iconName: "UploadCloud",
  },
  {
    number: "04",
    title: "Track Progress",
    description: "Monitor submissions, deadlines, and performance in real-time.",
    iconName: "BarChart3",
  },
];

const HowItWorksSection = () => {
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
          <span className={styles.label}>Platform Workflow</span>
          <h2 className={styles.title}>How AssignFlow Works</h2>
          <p className={styles.subtitle}>
            A simple and efficient workflow designed for students and educators.
          </p>
        </motion.div>

        <div className={styles.timeline}>
          {steps.map((step, index) => (
            <StepItem 
              key={index}
              index={index}
              isLast={index === steps.length - 1}
              {...step}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
