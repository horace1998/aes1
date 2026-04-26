import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import GlassCard from '@/components/ui/GlassCard';
import { format, subDays, eachDayOfInterval } from 'date-fns';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function computeTrends(goals) {
  const last14 = eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() });

  // Daily check-in counts over last 14 days
  const dailyCounts = last14.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const count = goals.reduce((sum, g) =>
      sum + (g.daily_checkins?.filter(c => c.date === dateStr && c.completed).length || 0), 0);
    return { date: format(day, 'MMM d'), day: format(day, 'EEE'), count, dateStr };
  });

  // Most productive day of week
  const byWeekday = Array(7).fill(0);
  goals.forEach(g => {
    g.daily_checkins?.forEach(c => {
      if (c.completed) {
        byWeekday[new Date(c.date).getDay()]++;
      }
    });
  });
  const topDayIdx = byWeekday.indexOf(Math.max(...byWeekday));

  // Consistency score: % of last 14 days with at least one check-in
  const daysWithCheckin = dailyCounts.filter(d => d.count > 0).length;
  const consistencyScore = Math.round((daysWithCheckin / 14) * 100);

  // Total all-time check-ins
  const totalCheckins = goals.reduce((sum, g) => sum + (g.daily_checkins?.filter(c => c.completed).length || 0), 0);

  return { dailyCounts, topDayIdx, consistencyScore, totalCheckins };
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-strong rounded-xl px-3 py-2">
        <p className="text-xs font-heading font-semibold">{payload[0].payload.date}</p>
        <p className="text-xs text-sky-500">{payload[0].value} check-ins</p>
      </div>
    );
  }
  return null;
};

export default function TrendsSection({ goals }) {
  const { dailyCounts, topDayIdx, consistencyScore } = useMemo(() => computeTrends(goals), [goals]);

  const maxCount = Math.max(...dailyCounts.map(d => d.count), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 25 }}
    >
      <p className="text-xs tracking-widest uppercase text-muted-foreground font-heading mb-4">
        Trends
      </p>

      {/* Consistency score + most productive day */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <GlassCard className="p-4 text-center" animate={false}>
          <p className="font-heading text-2xl font-bold text-sky-500">{consistencyScore}%</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Consistency Score</p>
          <div className="h-1.5 rounded-full bg-white/30 mt-2 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${consistencyScore}%` }}
              transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.5 }}
            />
          </div>
        </GlassCard>

        <GlassCard className="p-4 text-center" animate={false}>
          <p className="font-heading text-2xl font-bold text-cyan-600">{DAY_LABELS[topDayIdx]}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Most Productive</p>
          <p className="text-[9px] text-muted-foreground/60 mt-1">day of the week</p>
        </GlassCard>
      </div>

      {/* 14-day bar chart */}
      <GlassCard className="p-4" animate={false}>
        <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-heading mb-3">Last 14 Days</p>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={dailyCounts} barSize={10} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 9, fill: '#94a3b8', fontFamily: 'Space Grotesk' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis hide allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {dailyCounts.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.count > 0
                    ? entry.count === maxCount
                      ? 'url(#peakGrad)'
                      : 'url(#barGrad)'
                    : 'rgba(148,163,184,0.2)'
                  }
                />
              ))}
            </Bar>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7dd3fc" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="peakGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </motion.div>
  );
}