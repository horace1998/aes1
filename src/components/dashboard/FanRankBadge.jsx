import React from 'react';
import { motion } from 'framer-motion';
import { getFanRank, getNextRank, getRankScore } from '@/lib/fanRank';

export default function FanRankBadge({ totalCheckins = 0, milestoneCount = 0 }) {
  const rank = getFanRank(totalCheckins, milestoneCount);
  const score = getRankScore(totalCheckins, milestoneCount);
  const next = getNextRank(totalCheckins, milestoneCount);

  const progress = next
    ? Math.min(100, Math.round(((score - (rank.minScore || 0)) / (next.rank.minScore - (rank.minScore || 0))) * 100))
    : 100;

  return (
    <motion.div
      className="mb-7 relative overflow-hidden"
      style={{
        borderRadius: 20,
        background: 'linear-gradient(135deg, #0d1f6b 0%, #1a3aad 60%, #0a1540 100%)',
        border: '1px solid rgba(77, 127, 255, 0.35)',
        boxShadow: '0 8px 40px rgba(26, 58, 173, 0.45)',
        padding: '20px 22px 16px',
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
    >
      {/* Big ghost rank text */}
      <div
        className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
        style={{
          fontFamily: 'Bebas Neue, Impact, sans-serif',
          fontSize: 80,
          lineHeight: 1,
          color: 'rgba(255,255,255,0.06)',
          letterSpacing: '0.04em',
        }}
      >
        {rank.label}
      </div>

      {/* Header row */}
      <div className="flex items-start justify-between mb-1 relative">
        <span style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 9, fontWeight: 700, letterSpacing: '0.38em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
        }}>
          Fan Rank
        </span>
        <span style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 9, fontWeight: 700, letterSpacing: '0.3em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
        }}>
          {String(score).padStart(3, '0')} PTS
        </span>
      </div>

      {/* Rank title */}
      <div className="flex items-baseline gap-3 mb-4 relative">
        <h3
          style={{
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: 'clamp(2.2rem, 10vw, 3.5rem)',
            color: '#fff',
            lineHeight: 1,
            letterSpacing: '0.06em',
          }}
        >
          {rank.label}
        </h3>
        <p style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontStyle: 'italic', fontSize: 13,
          color: 'rgba(255,255,255,0.5)',
        }}>
          {rank.description}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', borderRadius: 99, background: 'rgba(255,255,255,0.75)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <p style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: 9, fontWeight: 600, letterSpacing: '0.3em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
        textAlign: 'right', marginTop: 7,
      }}>
        {next ? `${next.pointsNeeded} pts to ${next.rank.label}` : '— apex tier —'}
      </p>
    </motion.div>
  );
}