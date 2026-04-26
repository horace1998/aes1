import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { CheckCircle, Circle, Flame, TrendingUp } from 'lucide-react';
import { differenceInDays, addDays, addWeeks, addMonths, format } from 'date-fns';

function getEndDate(startDate, value, unit) {
  const start = new Date(startDate);
  if (unit === 'days') return addDays(start, value);
  if (unit === 'weeks') return addWeeks(start, value);
  return addMonths(start, value);
}

function getProgress(startDate, value, unit) {
  const start = new Date(startDate);
  const end = getEndDate(startDate, value, unit);
  const now = new Date();
  const totalDays = differenceInDays(end, start);
  const elapsed = differenceInDays(now, start);
  return Math.min(100, Math.max(0, Math.round((elapsed / totalDays) * 100)));
}

export default function GoalCard({ goal, onCheckin, index = 0 }) {
  const progress = getProgress(goal.start_date || goal.created_date, goal.timeline_value, goal.timeline_unit);
  const endDate = getEndDate(goal.start_date || goal.created_date, goal.timeline_value, goal.timeline_unit);
  const daysLeft = Math.max(0, differenceInDays(endDate, new Date()));
  const todayChecked = goal.daily_checkins?.some(c => c.date === format(new Date(), 'yyyy-MM-dd') && c.completed);

  return (
    <GlassCard
      variant="strong"
      className="p-5 mb-4"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 250, damping: 25, delay: index * 0.1 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-heading mb-1">
            {goal.idol_group}
          </p>
          <p className="font-heading text-sm font-bold text-foreground leading-snug">
            Before I meet <span className="text-purple-500">{goal.idol_name}</span>, I will{' '}
            <span className="text-teal-500">{goal.title}</span>
          </p>
        </div>
        {goal.status === 'completed' && (
          <div className="ml-3 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
          <span>{progress}% complete</span>
          <span>{daysLeft}d left</span>
        </div>
        <div className="h-2 rounded-full bg-white/30 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-teal-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.3 + index * 0.1 }}
          />
        </div>
      </div>

      {/* Timeline info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="glass-subtle rounded-lg px-2.5 py-1 flex items-center gap-1.5">
            <Flame className="w-3 h-3 text-orange-400" />
            <span className="text-xs font-medium">{goal.timeline_value} {goal.timeline_unit}</span>
          </div>
          <div className="glass-subtle rounded-lg px-2.5 py-1 flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-purple-400" />
            <span className="text-xs font-medium">{goal.daily_checkins?.filter(c => c.completed).length || 0} days</span>
          </div>
        </div>
        
        {goal.status === 'active' && (
          <motion.button
            className={`rounded-full p-2 transition-all ${
              todayChecked
                ? 'bg-emerald-500/20'
                : 'glass-subtle hover:bg-purple-500/10'
            }`}
            whileTap={{ scale: 0.9 }}
            onClick={() => !todayChecked && onCheckin?.(goal)}
          >
            {todayChecked ? (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
          </motion.button>
        )}
      </div>
    </GlassCard>
  );
}