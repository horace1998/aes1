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
      className={cn(variants[variant], 'rounded-2xl', className)}
      {...animateProps}
      {...props}
    >
      {children}
    </Component>
  );
}