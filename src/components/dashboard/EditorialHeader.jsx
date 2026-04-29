import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

/**
 * EditorialHeader — bold idol-focused header, teen editorial aesthetic.
 * Large name, italic bias, structural type contrasts.
 */
export default function EditorialHeader({ user }) {
  const today = new Date();
  const dateLabel = format(today, 'MMM d').toUpperCase();
  const firstName = user?.full_name?.split(' ')[0] || 'STAN';
  const bias = user?.favorite_idol;
  const group = user?.favorite_group;
  const focus = bias || group;

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <p className="editorial-eyebrow">{dateLabel}</p>
        {group && <p className="editorial-eyebrow">{group}</p>}
      </div>

      {/* Main identity block */}
      <div className="relative">
        {/* Big italic background text */}
        {focus && (
          <p
            className="editorial-italic text-foreground/[0.06] select-none pointer-events-none absolute -top-2 left-0 leading-none"
            style={{ fontSize: 'clamp(4.5rem, 22vw, 9rem)', fontWeight: 700, letterSpacing: '-0.04em' }}
            aria-hidden="true"
          >
            {focus.charAt(0).toUpperCase()}
          </p>
        )}

        {/* Foreground type */}
        <div className="relative z-10">
          <p className="editorial-eyebrow mb-1">Welcome back —</p>
          <motion.h1
            className="font-display text-foreground leading-none"
            style={{ fontSize: 'clamp(2.8rem, 13vw, 5rem)', fontWeight: 900, letterSpacing: '-0.03em' }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            {firstName}
          </motion.h1>

          {focus && (
            <motion.p
              className="editorial-italic text-foreground mt-1"
              style={{ fontSize: 'clamp(1rem, 4vw, 1.5rem)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              for {focus}
            </motion.p>
          )}
        </div>
      </div>

      <div className="editorial-rule mt-5" />
    </motion.div>
  );
}