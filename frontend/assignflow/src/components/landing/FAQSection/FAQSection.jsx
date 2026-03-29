import React from 'react';
import { motion } from 'framer-motion';
import FAQItem from '../../ui/FAQItem/FAQItem';
import styles from './FAQSection.module.css';

const faqs = [
  {
    question: "Who can use AssignFlow?",
    answer: "Only authorized users from the institution can access the platform using their registered email.",
  },
  {
    question: "How do students submit assignments?",
    answer: "Students can upload PDF or DOCX files directly through the dashboard in a few simple steps.",
  },
  {
    question: "Can faculty track student submissions?",
    answer: "Yes, faculty can view all submissions along with student details and submission timestamps.",
  },
  {
    question: "Is my data secure on AssignFlow?",
    answer: "Yes, the platform uses secure authentication and role-based access control to protect user data.",
  },
  {
    question: "Can I access assignments from anywhere?",
    answer: "Yes, the platform is accessible online with secure login, allowing you to manage work from anywhere.",
  },
  {
    question: "What file formats are supported for submission?",
    answer: "Currently, PDF and DOCX formats are supported for assignment submissions.",
  },
];

const FAQSection = () => {
  return (
    <section className={styles.section} id="faq">
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.label}>Support & Help</span>
          <h2 className={styles.title}>Frequently Asked Questions</h2>
          <p className={styles.subtitle}>
            Find answers to common questions about AssignFlow.
          </p>
        </motion.div>

        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <FAQItem 
              key={index}
              {...faq}
            />
          ))}
        </div>

        <motion.div 
          className={styles.cta}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className={styles.ctaText}>Still have questions?</p>
          <button className="btn-primary">Contact Support</button>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
