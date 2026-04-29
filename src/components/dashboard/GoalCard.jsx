import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { Check } from 'lucide-react';
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

const SWIPE_THRESHOLD = 100;

export default function GoalCard({ goal, onCheckin, onComplete, index = 0 }) {
  const progress = getProgress(goal.start_date || goal.created_date, goal.timeline_value, goal.timeline_unit);
  const endDate = getEndDate(goal.start_date || goal.created_date, goal.timeline_value, goal.timeline_unit);
  const daysLeft = Math.max(0, differenceInDays(endDate, new Date()));
  const todayChecked = goal.daily_checkins?.some(c => c.date === format(new Date(), 'yyyy-MM-dd') && c.completed);

  const x = useMotionValue(0);
  const actionOpacity = useTransform(x, [0, 40, 100], [0, 0.4, 1]);
  const [confirming, setConfirming] = useState(false);
  const isActive = goal.status === 'active';
  const canSwipe = isActive && !!onComplete;

  const handleDragEnd = (_, info) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      setConfirming(true);
    } else {
      x.set(0);
    }
  };

  const handleConfirm = () => {
    onComplete?.(goal);
    setConfirming(false);
  };

  const handleCancel = () => {
    setConfirming(false);
    x.set(0);
  };

  return (
    <div className="relative mb-2.5">
      {/* Swipe action background */}
      {canSwipe && (
        <motion.div
          className="absolute inset-0 rounded-xl flex items-center justify-start pl-6"
          style={{ opacity: actionOpacity, background: 'rgba(255,255,255,0.12)' }}
        >
          <p className="editorial-eyebrow" style={{ color: 'rgba(255,255,255,0.8)' }}>— Mark Complete</p>
        </motion.div>
      )}

      <motion.div
        drag={canSwipe ? 'x' : false}
        dragConstraints={{ left: 0, right: 120 }}
        dragElastic={0.15}
        style={{ x }}
        onDragEnd={handleDragEnd}
        animate={confirming ? { x: 110 } : undefined}
      >
        <GlassCard
          variant="strong"
          className="px-5 py-4 rounded-xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.05, 0.2) }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <p className="editorial-eyebrow truncate">
                  {goal.idol_group || goal.idol_name}
                </p>
                {goal.status === 'completed' && (
                  <p className="editorial-eyebrow text-foreground">— Closed</p>
                )}
              </div>
              <p className="font-display text-base text-foreground leading-snug line-clamp-2" style={{ fontWeight: 500 }}>
                {goal.title}
              </p>
              {goal.idol_name && goal.idol_name !== goal.idol_group && (
                <p className="editorial-italic text-xs text-muted-foreground mt-0.5">for {goal.idol_name}</p>
              )}

              {/* Progress — minimal hairline */}
              <div className="mt-3">
                <div className="h-px bg-foreground/15 relative">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-foreground"
                    style={{ height: '2px', top: '-0.5px' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                  />
                </div>
                <div className="flex justify-between editorial-eyebrow mt-2" style={{ fontSize: '9px', letterSpacing: '0.25em' }}>
                  <span>{goal.daily_checkins?.filter(c => c.completed).length || 0} entries · {progress}%</span>
                  <span>{daysLeft}d remaining</span>
                </div>
              </div>
            </div>

            {isActive && (
              <motion.button
                className={`flex-shrink-0 w-9 h-9 rounded-full transition-all flex items-center justify-center ${
                  todayChecked
                    ? 'bg-foreground border-foreground'
                    : 'border-foreground/20 hover:border-foreground'
                }`}
                style={{ border: todayChecked ? '1.5px solid rgba(255,255,255,0.8)' : '1.5px solid rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => !todayChecked && onCheckin?.(goal)}
              >
                {todayChecked && <Check className="w-4 h-4 text-background" strokeWidth={2.5} />}
              </motion.button>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Confirm dialog */}
      <AnimatePresence>
        {confirming && (
          <motion.div
            className="absolute inset-0 rounded-lg glass-strong flex items-center justify-between px-5 z-10 border border-foreground/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="editorial-italic text-sm text-foreground">Close this entry?</p>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="editorial-eyebrow px-3 py-1.5 border border-foreground/20"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="editorial-eyebrow px-3 py-1.5 bg-foreground text-background"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}