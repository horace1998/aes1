import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

/**
 * EditorialHeader — magazine-style hero section for the Dashboard.
 * Big oversized typography, date stamp, eyebrow, and tagline that
 * features the user's bias as the emotional hook.
 */
export default function EditorialHeader({ user }) {
  const today = new Date();
  const dateLabel = format(today, 'EEEE, MMMM d');
  const issueLabel = format(today, "'ISSUE' yyyy.MM.dd");
  const firstName = user?.full_name?.split(' ')[0] || 'Star';
  const bias = user?.favorite_idol;
  const group = user?.favorite_group;
  const focus = bias || group || 'your dream';

  return (
    <motion.div
      className="mb-10"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 180, damping: 24 }}
    >
      {/* Top row: issue + date */}
      <div className="flex items-center justify-between mb-5">
        <p className="editorial-eyebrow">{issueLabel}</p>
        <p className="editorial-eyebrow">{dateLabel}</p>
      </div>

      <div className="editorial-rule mb-6" />

      {/* Magazine masthead */}
      <div className="text-center">
        <p className="editorial-eyebrow mb-3">Today's Edition</p>
        <motion.h1
          className="font-display uppercase leading-[0.85] text-foreground"
          style={{ fontSize: 'clamp(3.2rem, 14vw, 5.5rem)', letterSpacing: '0.01em' }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 25 }}
        >
          {firstName}
        </motion.h1>

        <div className="flex items-center justify-center gap-3 my-5">
          <span className="editorial-rule flex-1 max-w-[60px]" />
          <p className="editorial-eyebrow">Stanning</p>
          <span className="editorial-rule flex-1 max-w-[60px]" />
        </div>

        <motion.p
          className="font-display uppercase tracking-wide leading-tight"
          style={{
            fontSize: 'clamp(1.5rem, 6vw, 2.25rem)',
            background: 'linear-gradient(135deg,#a78bfa 0%,#f472b6 60%,#7dd3fc 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          {focus}
        </motion.p>

        {bias && group && (
          <p className="text-[10px] text-muted-foreground font-heading tracking-[0.25em] uppercase mt-3">
            {group} — Bias
          </p>
        )}
      </div>

      <div className="editorial-rule mt-7" />
    </motion.div>
  );
}