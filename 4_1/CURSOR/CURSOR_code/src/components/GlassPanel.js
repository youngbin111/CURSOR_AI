import React from 'react';
import { motion } from 'framer-motion';

const GlassPanel = ({ 
  children, 
  className = '', 
  delay = 0, 
  glow = 'blue',
  ...props 
}) => {
  const glowColors = {
    blue: 'shadow-[0_0_20px_rgba(0,212,255,0.3)]',
    green: 'shadow-[0_0_20px_rgba(0,255,136,0.3)]',
    purple: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    red: 'shadow-[0_0_20px_rgba(255,0,0,0.3)]',
    yellow: 'shadow-[0_0_20px_rgba(255,255,0,0.3)]'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`glass-panel ${className}`}
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
        padding: '24px'
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassPanel;
