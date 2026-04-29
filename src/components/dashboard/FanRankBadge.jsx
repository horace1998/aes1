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
      className="mb-8 rounded-xl overflow-hidden relative"
      style={{ background: '#1a2a5e', border: '1px solid rgba(26,42,94,0.2)' }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Ticket notch decoration */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-white" />

      {/* Dashed divider */}
      <div className="absolute left-4 right-4 top-1/2 h-px" style={{ borderTop: '1px dashed rgba(255,255,255,0.15)' }} />

      <div className="px-5 pt-4 pb-2">
        <div className="flex items-baseline justify-between mb-1">
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 500, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
            Fan Rank
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 500, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
            {String(score).padStart(3, '0')} PTS
          </p>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-white tracking-widest uppercase" style={{ fontSize: 'clamp(1.6rem, 8vw, 2.5rem)', fontWeight: 900, letterSpacing: '0.08em' }}>
            {rank.label}
          </h3>
          <p className="editorial-italic text-sm text-right" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {rank.description}
          </p>
        </div>
      </div>

      <div className="px-5 pb-4">
        <div className="h-px relative overflow-visible" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <motion.div
            className="absolute inset-y-0 left-0"
            style={{ background: 'rgba(255,255,255,0.8)', height: '2px', top: '-1px' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 500, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textAlign: 'right', marginTop: 8 }}>
          {next ? `${next.pointsNeeded} PTS TO ${next.rank.label}` : '— APEX TIER —'}
        </p>
      </div>
    </motion.div>
  );
}