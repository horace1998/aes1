import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

/**
 * EditorialHeader — Vogue-style magazine masthead.
 * Pure typography, monochrome ink-on-paper aesthetic.
 */
export default function EditorialHeader({ user }) {
  const today = new Date();
  const dateLabel = format(today, "MMMM d, yyyy").toUpperCase();
  const volumeLabel = `VOL. ${format(today, 'yyyy')} · NO. ${format(today, 'DDD')}`;
  const firstName = user?.full_name?.split(' ')[0] || 'Reader';
  const bias = user?.favorite_idol;
  const group = user?.favorite_group;
  const focus = bias || group;

  return (
    <motion.div
      className="mb-12"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Top metadata row */}
      <div className="flex items-center justify-between mb-3">
        <p className="editorial-eyebrow">{volumeLabel}</p>
        <p className="editorial-eyebrow">{dateLabel}</p>
      </div>

      <div className="editorial-rule-thick mb-1" />
      <div className="editorial-rule mb-8" />

      {/* Masthead */}
      <div className="text-center">
        <p className="editorial-eyebrow mb-4">The Diary</p>

        <motion.h1
          className="font-display leading-[0.92] text-foreground"
          style={{
            fontSize: 'clamp(3.5rem, 15vw, 6rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {firstName}
        </motion.h1>

        {focus && (
          <>
            <div className="flex items-center justify-center gap-4 my-6">
              <span className="editorial-rule flex-1 max-w-[80px]" />
              <p className="editorial-eyebrow">Devoted To</p>
              <span className="editorial-rule flex-1 max-w-[80px]" />
            </div>

            <motion.p
              className="editorial-italic text-foreground"
              style={{ fontSize: 'clamp(1.4rem, 5.5vw, 2rem)', lineHeight: 1.1 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {focus}
            </motion.p>

            {bias && group && (
              <p className="editorial-eyebrow mt-3">{group}</p>
            )}
          </>
        )}
      </div>

      <div className="editorial-rule mt-10" />
    </motion.div>
  );
}