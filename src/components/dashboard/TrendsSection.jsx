import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function computeTrends(goals) {
  const last14 = eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() });

  const dailyCounts = last14.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const count = goals.reduce((sum, g) =>
      sum + (g.daily_checkins?.filter(c => c.date === dateStr && c.completed).length || 0), 0);
    return { date: format(day, 'MMM d'), day: format(day, 'EEE'), count, dateStr };
  });

  const byWeekday = Array(7).fill(0);
  goals.forEach(g => {
    g.daily_checkins?.forEach(c => {
      if (c.completed) byWeekday[new Date(c.date).getDay()]++;
    });
  });
  const topDayIdx = byWeekday.indexOf(Math.max(...byWeekday));

  const daysWithCheckin = dailyCounts.filter(d => d.count > 0).length;
  const consistencyScore = Math.round((daysWithCheckin / 14) * 100);

  return { dailyCounts, topDayIdx, consistencyScore };
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-background border border-foreground/20 px-3 py-2 rounded-sm">
        <p className="editorial-eyebrow">{payload[0].payload.date}</p>
        <p className="font-display text-sm text-foreground" style={{ fontWeight: 600 }}>
          {payload[0].value} {payload[0].value === 1 ? 'entry' : 'entries'}
        </p>
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-5">
        <p className="editorial-eyebrow">Almanac — Last Fortnight</p>
        <span className="editorial-rule flex-1 mx-4" />
        <p className="editorial-eyebrow">II</p>
      </div>

      {/* Two stats — editorial pair */}
      <div className="grid grid-cols-2 border-t border-b border-foreground/15 mb-6">
        <div className="text-center py-5 border-r border-foreground/15">
          <p className="font-display text-3xl text-foreground" style={{ fontWeight: 600 }}>
            {String(consistencyScore).padStart(2, '0')}<span className="text-base text-muted-foreground">%</span>
          </p>
          <p className="editorial-eyebrow mt-1">Consistency</p>
        </div>
        <div className="text-center py-5">
          <p className="font-display text-3xl text-foreground tracking-wide uppercase" style={{ fontWeight: 600 }}>
            {DAY_LABELS[topDayIdx]}
          </p>
          <p className="editorial-eyebrow mt-1">Most Productive</p>
        </div>
      </div>

      {/* Chart — pure monochrome */}
      <div>
        <p className="editorial-eyebrow mb-3">Daily Cadence</p>
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={dailyCounts} barSize={8} margin={{ top: 4, right: 0, left: -32, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 9, fill: 'rgba(26,42,94,0.5)', fontFamily: 'Inter', letterSpacing: '0.2em' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(26,42,94,0.15)' }}
            />
            <YAxis hide allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="count">
              {dailyCounts.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    entry.count === 0
                      ? 'rgba(26,42,94,0.08)'
                      : entry.count === maxCount
                        ? '#1a2a5e'
                        : 'rgba(26,42,94,0.45)'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}