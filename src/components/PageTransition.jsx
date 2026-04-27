import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition — dreamy, cohesive page transitions.
 * Soft blur + gentle scale + opacity makes navigations feel like
 * one continuous glassy surface morphing between views.
 */
export default function PageTransition({ children }) {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 16, scale: 0.985, filter: 'blur(14px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -10, scale: 1.01, filter: 'blur(14px)' }}
      transition={{
        opacity: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        y: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        filter: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
      }}
      style={{ willChange: 'transform, opacity, filter' }}
    >
      {children}
    </motion.div>
  );
}