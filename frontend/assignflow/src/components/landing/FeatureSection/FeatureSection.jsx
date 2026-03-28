import React from 'react';
import { motion } from 'framer-motion';
import FeatureCard from '../../ui/FeatureCard/FeatureCard';
import styles from './FeatureSection.module.css';

const features = [
  {
    title: "Assignment Management",
    description: "Easily create, assign, and manage academic tasks with a single, intuitive interface.",
    iconName: "FileText",
  },
  {
    title: "Progress Tracking",
    description: "Monitor your grades and track your academic growth with visual real-time analytics.",
    iconName: "BarChart3",
  },
  {
    title: "Role-Based Dashboards",
    description: "Personalized experiences for Students, Teachers, and Admins to stay organized efficiently.",
    iconName: "Users",
  },
  {
    title: "Deadline Reminders",
    description: "Never miss a due date again with smart reminders for your upcoming assignments.",
    iconName: "Calendar",
  },
  {
    title: "File Upload & Submissions",
    description: "Securely upload assignments and maintain a cloud-based history of your work.",
    iconName: "UploadCloud",
  },
  {
    title: "Smart Notifications",
    description: "Stay updated with real-time alerts for grade updates, new tasks, and announcements.",
    iconName: "Bell",
  },
];

const FeatureSection = () => {
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
          <span className={styles.label}>Excellence in Education</span>
          <h2 className={styles.title}>Powerful Features to Simplify Academic Work</h2>
          <p className={styles.subtitle}>
            AssignFlow provides a comprehensive suite of tools designed to bridge the gap 
            between faculty and students through seamless collaboration.
          </p>
        </motion.div>

        <div className={styles.grid}>
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              index={index}
              {...feature}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
