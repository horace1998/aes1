import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function GlassButton({ children, className, variant = 'primary', onClick, disabled, ...props }) {
  const baseClass = 'relative overflow-hidden rounded-2xl px-6 py-3 font-heading font-semibold text-sm transition-all duration-300 cursor-pointer select-none';
  
  const variants = {
    primary: 'bg-foreground text-background shadow-sm',
    secondary: 'border border-foreground/15 text-foreground bg-transparent',
    accent: 'bg-foreground text-background shadow-sm',
    ghost: 'bg-transparent text-foreground hover:bg-foreground/5',
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