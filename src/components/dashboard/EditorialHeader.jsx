import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function EditorialHeader({ user }) {
  const today = new Date();
  const dateLabel = format(today, 'MMM d').toUpperCase();
  const name = user?.full_name || user?.email?.split('@')[0] || 'STAN';
  const bias = user?.favorite_idol;
  const group = user?.favorite_group;
  const focus = bias || group || 'IDOL';

  return (
    <motion.div
      className="mb-8 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Ghost background letter */}
      <p
        className="absolute -top-4 -left-2 font-display leading-none select-none pointer-events-none"
        style={{
          fontSize: 'clamp(7rem, 38vw, 16rem)',
          fontWeight: 900,
          color: 'rgba(26,42,94,0.04)',
          letterSpacing: '-0.05em',
        }}
        aria-hidden="true"
      >
        {focus.charAt(0).toUpperCase()}
      </p>

      {/* Top row */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <p className="editorial-eyebrow">{dateLabel}</p>
        {group && (
          <span
            className="text-[9px] font-heading font-bold tracking-[0.25em] uppercase px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(26,42,94,0.08)', color: '#1a2a5e', border: '1px solid rgba(26,42,94,0.15)' }}
          >
            {group}
          </span>
        )}
      </div>

      {/* Main identity */}
      <div className="relative z-10">
        <p className="editorial-eyebrow mb-1">WELCOME BACK —</p>

        <motion.h1
          className="font-display leading-none"
          style={{ fontSize: 'clamp(3rem, 15vw, 6rem)', fontWeight: 900, letterSpacing: '-0.04em', color: '#111827' }}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {name}
        </motion.h1>

        {focus && (
          <motion.div
            className="flex items-center gap-2 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <span className="editorial-italic" style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.3rem)', color: '#1a2a5e' }}>
              for {focus}
            </span>
            <span className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="w-1.5 h-px" style={{ background: 'rgba(26,42,94,0.2)' }} />
              ))}
            </span>
          </motion.div>
        )}
      </div>

      <div className="mt-4 h-px" style={{ background: 'rgba(0,0,0,0.1)' }} />
    </motion.div>
  );
}