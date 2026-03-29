import React from 'react';
import { motion } from 'framer-motion';
import WhyCard from '../../ui/WhyCard/WhyCard';
import styles from './WhyChooseUsSection.module.css';

const reasons = [
  {
    title: "Centralized Academic Management",
    description: "All assignments, submissions, and tracking in one unified platform.",
    icon: "Layers",
  },
  {
    title: "Role-Based Access System",
    description: "Separate dashboards for students, faculty, and admin for better control.",
    icon: "Users",
    isFeatured: true,
  },
  {
    title: "Secure & Controlled Access",
    description: "Only authorized institutional users can access the platform.",
    icon: "ShieldCheck",
  },
  {
    title: "Smart Workflow Automation",
    description: "Streamlined assignment creation, submission, and evaluation process.",
    icon: "Workflow",
  },
  {
    title: "Scalable & Future-Ready",
    description: "Designed to support growing academic needs and advanced features.",
    icon: "TrendingUp",
  },
  {
    title: "Clean & Intuitive Interface",
    description: "Minimal, user-friendly UI for a seamless experience.",
    icon: "LayoutDashboard",
  },
];

const WhyChooseUsSection = () => {
  return (
    <section className={styles.section} id="why-choose-us">
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.label}>Built for Institutions</span>
          <h2 className={styles.title}>Why Choose AssignFlow?</h2>
          <p className={styles.subtitle}>
            Built to simplify academic workflows and enhance productivity for institutions.
          </p>
        </motion.div>

        <div className={styles.grid}>
          {reasons.map((reason, index) => (
            <WhyCard 
              key={index}
              index={index}
              {...reason}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
