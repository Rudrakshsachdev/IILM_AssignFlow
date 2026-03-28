import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TestimonialCard from '../../ui/TestimonialCard/TestimonialCard';
import styles from './TestimonialsSection.module.css';

const testimonials = {
  students: [
    {
      name: "Rudraksh Sachdeva",
      role: "Student",
      feedback: "AssignFlow made managing assignments effortless and organized. It really improved my productivity.",
    },
    {
      name: "Shivansee",
      role: "Student",
      feedback: "The interface is clean and super easy to use. I never miss deadlines anymore!",
    },
    {
      name: "Devansh",
      role: "Student",
      feedback: "Tracking my submissions and progress has never been this simple.",
    },
    {
      name: "Yug Prakash",
      role: "Student",
      feedback: "Everything is in one place — assignments, deadlines, and updates. Love it!",
    },
    {
      name: "Khushi Diwan",
      role: "Student",
      feedback: "This platform actually makes academic work less stressful.",
    },
    {
      name: "Akshit Singh",
      role: "Student",
      feedback: "Smooth experience and very helpful for staying organized.",
    },
  ],

  faculty: [
    {
      name: "Dr. Shamik Tiwari",
      role: "Faculty",
      feedback: "AssignFlow simplifies assignment distribution and tracking for faculty.",
    },
    {
      name: "Dr. Anurag Jain",
      role: "Faculty",
      feedback: "A very efficient system for managing student submissions and deadlines.",
    },
    {
      name: "Dr. Sapna Arora",
      role: "Faculty",
      feedback: "The platform is intuitive and saves a lot of administrative time.",
    },
    {
      name: "Dr. Sonam Lata",
      role: "Faculty",
      feedback: "Helps maintain structure and clarity in academic workflows.",
    },
    {
      name: "Dr. Pooja Batra Nagpal",
      role: "Faculty",
      feedback: "A reliable tool for managing coursework efficiently.",
    },
    {
      name: "Dr. Pooja Acharya",
      role: "Faculty",
      feedback: "Improves communication and assignment tracking significantly.",
    },
    {
      name: "Dr. Vaishali Maheshwari",
      role: "Faculty",
      feedback: "A great addition to modern academic systems.",
    },
  ],
};

const TestimonialsSection = () => {
  const [activeTab, setActiveTab] = useState('students');

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
          <span className={styles.label}>Real Feedback</span>
          <h2 className={styles.title}>What Our Users Say</h2>
          <p className={styles.subtitle}>
            Real feedback from students and faculty using AssignFlow across their academic journey.
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <div className={styles.tabContainer}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'students' ? styles.active : ''}`}
            onClick={() => setActiveTab('students')}
          >
            🎓 Students
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'faculty' ? styles.active : ''}`}
            onClick={() => setActiveTab('faculty')}
          >
            👨‍🏫 Faculty
          </button>
        </div>

        <div className={styles.gridContainer}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              className={styles.grid}
              initial={{ opacity: 0, x: activeTab === 'students' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === 'students' ? 20 : -20 }}
              transition={{ duration: 0.4 }}
            >
              {testimonials[activeTab].map((item, index) => (
                <TestimonialCard 
                  key={`${activeTab}-${index}`}
                  index={index}
                  {...item}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
