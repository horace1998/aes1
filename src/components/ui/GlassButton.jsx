import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function GlassButton({ children, className, variant = 'primary', onClick, disabled, ...props }) {
  const baseClass = 'relative overflow-hidden rounded-2xl px-6 py-3 font-heading font-semibold text-sm transition-all duration-300 cursor-pointer select-none';
  
  const variants = {
    primary: 'bg-gradient-to-r from-violet-400 to-indigo-400 text-white shadow-md shadow-violet-300/40 hover:shadow-violet-400/50',
    secondary: 'glass text-foreground hover:bg-white/70',
    accent: 'bg-gradient-to-r from-pink-300 to-violet-300 text-white shadow-md shadow-pink-300/30',
    ghost: 'bg-transparent text-foreground hover:bg-white/20',
  };

  return (
    <motion.button
      className={cn(baseClass, variants[variant], disabled && 'opacity-50 pointer-events-none', className)}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...props}
    >
      {children}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 pointer-events-none" />
    </motion.button>
  );
}