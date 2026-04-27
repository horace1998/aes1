import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition — instant-feel transition with a soft dreamy fade.
 * No exit animation = no blank pause when navigating between pages.
 * The new page just glides in over the previous one.
 */
export default function PageTransition({ children }) {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{
        opacity: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
        y: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
        filter: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
      }}
      style={{ willChange: 'transform, opacity, filter' }}
    >
      {children}
    </motion.div>
  );
}