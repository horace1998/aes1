import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function GlassCard({ children, className, variant = 'default', animate = true, ...props }) {
  const variants = {
    default: 'glass',
    strong: 'glass-strong',
    subtle: 'glass-subtle',
  };

  const Component = animate ? motion.div : 'div';
  const animateProps = animate ? {
    initial: { opacity: 0, y: 20, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  } : {};

  return (
    <Component
      className={cn(variants[variant], 'rounded-2xl relative overflow-hidden', className)}
      {...animateProps}
      {...props}
    >
      {/* Metallic top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
      {/* Side chrome */}
      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-white/50 via-white/20 to-transparent pointer-events-none" />
      {children}
    </Component>
  );
}