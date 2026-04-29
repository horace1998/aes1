import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
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
    if (info.offset.x > SWIPE_THRESHOLD) setConfirming(true);
    else x.set(0);
  };

  return (
    <div className="relative mb-3">
      {/* Swipe action reveal */}
      {canSwipe && (
        <motion.div
          className="absolute inset-0 flex items-center justify-start pl-5"
          style={{
            opacity: actionOpacity,
            borderRadius: 16,
            background: 'linear-gradient(90deg, rgba(26,58,173,0.25) 0%, transparent 100%)',
          }}
        >
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 9, fontWeight: 700, letterSpacing: '0.32em',
            textTransform: 'uppercase', color: '#4d7fff',
          }}>
            → Complete
          </span>
        </motion.div>
      )}

      <motion.div
        drag={canSwipe ? 'x' : false}
        dragConstraints={{ left: 0, right: 120 }}
        dragElastic={0.12}
        style={{ x }}
        onDragEnd={handleDragEnd}
        animate={confirming ? { x: 110 } : undefined}
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.06, 0.22) }}
      >
        <div
          style={{
            borderRadius: 16,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '16px 18px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              {/* Eyebrow */}
              <div className="flex items-center justify-between mb-2">
                <span style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.35em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
                }}>
                  {goal.idol_group || goal.idol_name}
                </span>
                {goal.status === 'completed' && (
                  <span style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.3em',
                    textTransform: 'uppercase', color: 'rgba(77,127,255,0.7)',
                  }}>
                    ✓ Closed
                  </span>
                )}
              </div>

              {/* Title */}
              <p style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 15, fontWeight: 500,
                color: '#fff', lineHeight: 1.35,
                letterSpacing: '-0.01em',
              }} className="line-clamp-2">
                {goal.title}
              </p>

              {goal.idol_name && goal.idol_name !== goal.idol_group && (
                <p style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontStyle: 'italic', fontSize: 12,
                  color: 'rgba(255,255,255,0.4)', marginTop: 3,
                }}>
                  for {goal.idol_name}
                </p>
              )}

              {/* Progress */}
              <div className="mt-4">
                <div style={{ height: 2, borderRadius: 99, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  <motion.div
                    style={{
                      height: '100%', borderRadius: 99,
                      background: 'linear-gradient(90deg, #1a3aad, #4d7fff)',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  />
                </div>
                <div className="flex justify-between mt-2" style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 9, fontWeight: 600, letterSpacing: '0.22em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)',
                }}>
                  <span>{goal.daily_checkins?.filter(c => c.completed).length || 0} entries · {progress}%</span>
                  <span>{daysLeft}d left</span>
                </div>
              </div>
            </div>

            {/* Check-in button */}
            {isActive && (
              <motion.button
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center"
                style={{
                  borderRadius: 12,
                  background: todayChecked
                    ? 'linear-gradient(135deg, #1a3aad, #4d7fff)'
                    : 'rgba(255,255,255,0.06)',
                  border: todayChecked
                    ? '1px solid rgba(77,127,255,0.5)'
                    : '1px solid rgba(255,255,255,0.12)',
                  boxShadow: todayChecked ? '0 4px 16px rgba(26,58,173,0.4)' : 'none',
                }}
                whileTap={{ scale: 0.88 }}
                onClick={() => !todayChecked && onCheckin?.(goal)}
              >
                {todayChecked
                  ? <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                  : <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>+</span>
                }
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Confirm overlay */}
      <AnimatePresence>
        {confirming && (
          <motion.div
            className="absolute inset-0 flex items-center justify-between px-5 z-10"
            style={{
              borderRadius: 16,
              background: 'rgba(13, 17, 35, 0.95)',
              border: '1px solid rgba(26, 58, 173, 0.5)',
              backdropFilter: 'blur(20px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 14, color: '#fff' }}>
              Close this entry?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setConfirming(false); x.set(0); }}
                style={{
                  fontFamily: 'Space Grotesk, sans-serif', fontSize: 9,
                  fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase',
                  border: '1px solid rgba(255,255,255,0.18)', borderRadius: 8,
                  padding: '6px 12px', color: 'rgba(255,255,255,0.6)', background: 'transparent',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => { onComplete?.(goal); setConfirming(false); }}
                style={{
                  fontFamily: 'Space Grotesk, sans-serif', fontSize: 9,
                  fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase',
                  background: 'linear-gradient(135deg, #1a3aad, #0d1f6b)',
                  border: '1px solid rgba(77,127,255,0.4)', borderRadius: 8,
                  padding: '6px 12px', color: '#fff',
                }}
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