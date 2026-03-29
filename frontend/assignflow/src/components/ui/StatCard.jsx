import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, subtitle, color, delay, className }) => {
  return (
    <motion.div 
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
      whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        padding: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div 
        style={{ 
          width: '56px', 
          height: '56px', 
          borderRadius: '14px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          flexShrink: 0,
          backgroundColor: `${color}15`
        }}
      >
        <Icon size={24} color={color} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.1', margin: 0 }}>
          {value}
        </h3>
        <p style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--secondary-color)', marginTop: '0.2rem', margin: 0 }}>
          {title}
        </p>
        {subtitle && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem', margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
