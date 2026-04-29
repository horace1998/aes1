import React from 'react';
import { motion } from 'framer-motion';

/**
 * BiasMonogram — stylized big-letter card representing the user's bias / group.
 * No idol photos used. Pure typography on a gradient.
 *
 * Picks a deterministic gradient based on the bias name so each fan's
 * monogram feels personally theirs but always matches the SYNKIFY palette.
 */
const GRADIENTS = [
  'from-violet-400 via-fuchsia-300 to-pink-300',
  'from-indigo-400 via-violet-400 to-pink-300',
  'from-sky-300 via-violet-300 to-pink-300',
  'from-rose-300 via-pink-300 to-violet-400',
  'from-amber-200 via-pink-300 to-violet-400',
  'from-emerald-200 via-sky-300 to-violet-400',
];

function pickGradient(seed = '') {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

export default function BiasMonogram({ biasName, groupName, size = 'lg' }) {
  const subject = (biasName || groupName || '?').trim();
  const letter = subject.charAt(0).toUpperCase() || '?';
  const gradient = pickGradient(subject + groupName);

  const sizes = {
    md: { box: 'w-20 h-20', letter: 'text-5xl' },
    lg: { box: 'w-32 h-32', letter: 'text-7xl' },
    xl: { box: 'w-40 h-40', letter: 'text-8xl' },
  };
  const s = sizes[size] || sizes.lg;

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
    >
      <div
        className={`relative ${s.box} rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-xl shadow-violet-300/30 overflow-hidden`}
      >
        {/* Iridescent overlay */}
        <div className="absolute inset-0 opacity-50 mix-blend-overlay bg-gradient-to-tr from-white/60 via-transparent to-white/30" />
        {/* Soft inner ring */}
        <div className="absolute inset-1.5 rounded-3xl ring-1 ring-white/40 pointer-events-none" />
        <span
          className={`font-display ${s.letter} text-white drop-shadow-lg leading-none tracking-tight relative z-10`}
          style={{ textShadow: '0 4px 18px rgba(120,80,180,0.35)' }}
        >
          {letter}
        </span>
      </div>

      {/* Caption */}
      {(biasName || groupName) && (
        <div className="mt-3 text-center">
          {biasName && (
            <p className="font-heading text-base font-bold text-foreground tracking-wide">
              {biasName}
            </p>
          )}
          {groupName && (
            <p className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground font-heading mt-0.5">
              {groupName}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}