import React from 'react';
import { motion } from 'framer-motion';
import { getFanRank, getNextRank, getRankScore } from '@/lib/fanRank';
import GlassCard from '@/components/ui/GlassCard';

export default function FanRankBadge({ totalCheckins, milestoneCount, compact = false }) {
  const rank = getFanRank(totalCheckins, milestoneCount);
  const next = getNextRank(totalCheckins, milestoneCount);
  const score = getRankScore(totalCheckins, milestoneCount);
  const progressPct = next
    ? Math.round(((score - (next.rank.minScore - next.pointsNeeded)) / next.pointsNeeded) * 100)
    : 100;

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 glass-subtle rounded-full px-3 py-1`}>
        <span className="text-sm">{rank.emoji}</span>
        <span className={`text-xs font-heading font-bold ${rank.textColor}`}>{rank.label}</span>
      </div>
    );
  }

  return (
    <GlassCard variant="strong" className="p-5 mb-6" animate={false}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-heading mb-0.5">Fan Rank</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{rank.emoji}</span>
            <span className={`font-heading text-xl font-bold bg-gradient-to-r ${rank.color} bg-clip-text text-transparent`}>
              {rank.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{rank.description}</p>
        </div>
        <div className="text-right">
          <p className="font-heading text-2xl font-bold text-foreground">{score}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</p>
        </div>
      </div>

      {/* Progress to next rank */}
      {next ? (
        <div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
            <span>{rank.label}</span>
            <span>{next.rank.emoji} {next.rank.label} in {next.pointsNeeded} pts</span>
          </div>
          <div className="h-2 rounded-full bg-white/30 overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${rank.color}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progressPct)}%` }}
              transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.3 }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">
            {totalCheckins} check-ins · {milestoneCount} milestones
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xs text-orange-500 font-heading font-semibold">👑 Maximum Rank Achieved</p>
        </div>
      )}
    </GlassCard>
  );
}