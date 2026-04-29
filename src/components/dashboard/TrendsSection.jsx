import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { format, subDays } from 'date-fns';

function buildLast14(goals) {
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const label = format(subDays(new Date(), i), 'EEE').charAt(0);
    let count = 0;
    goals.forEach(g => {
      if (g.daily_checkins?.some(c => c.date === d && c.completed)) count++;
    });
    days.push({ date: d, label, count });
  }
  return days;
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(13, 31, 107, 0.95)', border: '1px solid rgba(77,127,255,0.4)',
      borderRadius: 8, padding: '6px 10px', backdropFilter: 'blur(12px)',
    }}>
      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, color: '#fff', fontWeight: 600 }}>
        {payload[0].value} check-in{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

export default function TrendsSection({ goals }) {
  const data = buildLast14(goals);
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const activeDays = data.filter(d => d.count > 0).length;
  const consistency = Math.round((activeDays / 14) * 100);
  const bestDay = data.reduce((best, d) => d.count > best.count ? d : best, data[0]);
  const bestLabel = bestDay?.count > 0 ? format(new Date(bestDay.date), 'EEE').toUpperCase() : '—';

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.15 }}
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <span style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 9, fontWeight: 700, letterSpacing: '0.35em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
        }}>
          Almanac — Last Fortnight
        </span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
      </div>

      <div
        style={{
          borderRadius: 16,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          padding: '18px 18px 14px',
        }}
      >
        {/* Stats row */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <p style={{
              fontFamily: 'Bebas Neue, Impact, sans-serif',
              fontSize: 44, color: '#fff', lineHeight: 1, letterSpacing: '0.02em',
            }}>
              {consistency}<span style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>%</span>
            </p>
            <p style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 9, fontWeight: 700, letterSpacing: '0.3em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: 2,
            }}>
              Consistency
            </p>
          </div>
          <div className="text-right">
            <p style={{
              fontFamily: 'Bebas Neue, Impact, sans-serif',
              fontSize: 44, color: '#4d7fff', lineHeight: 1, letterSpacing: '0.02em',
            }}>
              {bestLabel}
            </p>
            <p style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 9, fontWeight: 700, letterSpacing: '0.3em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: 2,
            }}>
              Most Productive
            </p>
          </div>
        </div>

        {/* Bar chart */}
        <div style={{ height: 64 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={12} barGap={3}>
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="count" radius={[4, 4, 2, 2]}>
                {data.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.count === 0
                        ? 'rgba(255,255,255,0.06)'
                        : entry.count === maxCount
                          ? '#4d7fff'
                          : 'rgba(26, 58, 173, 0.6)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Day labels */}
        <div className="flex justify-between mt-2 px-0.5">
          {data.map((d, i) => (
            (i % 2 === 0) && (
              <span key={d.date} style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 8, fontWeight: 600, letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase',
              }}>
                {d.label}
              </span>
            )
          ))}
        </div>
      </div>
    </motion.div>
  );
}