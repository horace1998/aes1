import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function GlassButton({ children, className, variant = 'primary', onClick, disabled, ...props }) {
  const baseClass = 'relative overflow-hidden rounded-2xl px-6 py-3 font-heading font-semibold text-sm transition-all duration-300 cursor-pointer select-none';
  
  const variants = {
    primary: 'text-white shadow-lg shadow-purple-500/30',
    secondary: 'glass text-foreground',
    accent: 'text-white shadow-lg shadow-teal-500/25',
    ghost: 'bg-transparent text-foreground hover:bg-white/15',
  };

  const gradients = {
    primary: 'linear-gradient(135deg, rgba(168,100,255,1) 0%, rgba(99,130,255,1) 50%, rgba(80,200,220,0.9) 100%)',
    accent: 'linear-gradient(135deg, rgba(52,211,153,1) 0%, rgba(16,185,129,1) 100%)',
    secondary: undefined,
    ghost: undefined,
  };

  return (
    <motion.button
      className={cn(baseClass, variants[variant], disabled && 'opacity-50 pointer-events-none', className)}
      style={gradients[variant] ? { background: gradients[variant] } : undefined}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02, filter: 'brightness(1.08)' }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...props}
    >
      {children}
      {/* Chrome top highlight */}
      <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-2xl bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
      {/* Metallic sheen sweep */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-white/5 pointer-events-none" />
    </motion.button>
  );
}