import React from 'react';
import { motion } from 'framer-motion';
import { getFanRank, getNextRank, getRankScore } from '@/lib/fanRank';

/**
 * FanRankBadge — editorial, monochrome rank display.
 * Shows the user's current fan rank with score and progress toward the next tier.
 */
export default function FanRankBadge({ totalCheckins = 0, milestoneCount = 0 }) {
  const rank = getFanRank(totalCheckins, milestoneCount);
  const score = getRankScore(totalCheckins, milestoneCount);
  const next = getNextRank(totalCheckins, milestoneCount);

  const progress = next
    ? Math.min(100, Math.round(((score - (rank.minScore || 0)) / (next.rank.minScore - (rank.minScore || 0))) * 100))
    : 100;

  return (
    <motion.div
      className="border-t border-b border-foreground/15 py-5 mb-8"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-baseline justify-between mb-2">
        <p className="editorial-eyebrow">Rank</p>
        <p className="editorial-eyebrow">{String(score).padStart(3, '0')} pts</p>
      </div>

      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display text-3xl tracking-wide uppercase text-foreground" style={{ fontWeight: 600 }}>
          {rank.label}
        </h3>
        <p className="editorial-italic text-sm text-muted-foreground text-right">
          {rank.description}
        </p>
      </div>

      {next ? (
        <div className="mt-3">
          <div className="h-px bg-foreground/10 relative overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-foreground"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ height: '2px', top: '-1px' }}
            />
          </div>
          <p className="editorial-eyebrow mt-2 text-right">
            {next.pointsNeeded} pts to {next.rank.label}
          </p>
        </div>
      ) : (
        <p className="editorial-eyebrow mt-3 text-right">— Apex Tier —</p>
      )}
    </motion.div>
  );
}