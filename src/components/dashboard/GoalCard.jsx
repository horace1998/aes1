import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { CheckCircle, Circle, Flame } from 'lucide-react';
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
      className="px-3.5 py-3 mb-2.5"
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26, delay: Math.min(index * 0.05, 0.2) }}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[9px] tracking-widest uppercase text-muted-foreground font-heading truncate">
              {goal.idol_group || goal.idol_name}
            </p>
            {goal.status === 'completed' && (
              <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
            )}
          </div>
          <p className="font-heading text-xs font-bold text-foreground leading-snug line-clamp-2">
            <span className="text-violet-500">{goal.idol_name}</span> · {goal.title}
          </p>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="h-1.5 rounded-full bg-white/30 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-300 to-indigo-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 22, delay: 0.15 }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Flame className="w-2.5 h-2.5 text-pink-400" />
                {goal.daily_checkins?.filter(c => c.completed).length || 0}d · {progress}%
              </span>
              <span>{daysLeft}d left</span>
            </div>
          </div>
        </div>

        {goal.status === 'active' && (
          <motion.button
            className={`rounded-full p-1.5 flex-shrink-0 transition-all ${
              todayChecked ? 'bg-emerald-500/20' : 'glass-subtle hover:bg-violet-300/20'
            }`}
            whileTap={{ scale: 0.9 }}
            onClick={() => !todayChecked && onCheckin?.(goal)}
          >
            {todayChecked ? (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground" />
            )}
          </motion.button>
        )}
      </div>
    </GlassCard>
  );
}