import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ThreeBackground from '@/components/ThreeBackground';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import PageShell from '@/components/PageShell';
import { User, CheckCircle2, Flame, Target, LogOut, Heart, TrendingUp } from 'lucide-react';
import FanRankBadge from '@/components/dashboard/FanRankBadge';

export default function Profile() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list('-created_date'),
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones'],
    queryFn: () => base44.entities.Milestone.list('-created_date'),
  });

  const totalCheckins = goals.reduce((sum, g) => sum + (g.daily_checkins?.filter(c => c.completed).length || 0), 0);
  const completedGoals = goals.filter(g => g.status === 'completed').length;

  if (!user) return null;

  return (
    <div className="min-h-screen relative pb-28">
      <PageShell goals={goals} user={user}>
      <ThreeBackground />

      <div className="relative z-10 px-6 pt-14">
        {/* Profile Header */}
        <motion.div
          className="flex flex-col items-center text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          <div className="w-20 h-20 rounded-full glass-strong flex items-center justify-center mb-4 ring-2 ring-violet-300/40">
            <User className="w-8 h-8 text-violet-500" />
          </div>
          <h1 className="font-display text-4xl tracking-wide uppercase">{user.full_name || 'Station Member'}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {user.favorite_idol && (
            <div className="flex items-center gap-1.5 mt-2 glass-subtle rounded-full px-3 py-1">
              <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
              <span className="text-xs font-heading">{user.favorite_idol}</span>
            </div>
          )}
        </motion.div>

        {/* Fan Rank */}
        <FanRankBadge totalCheckins={totalCheckins} milestoneCount={milestones.length} />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { label: 'Total Goals', value: goals.length, icon: Target, color: 'text-violet-400' },
            { label: 'Completed', value: completedGoals, icon: CheckCircle2, color: 'text-indigo-400' },
            { label: 'Check-ins', value: totalCheckins, icon: Flame, color: 'text-pink-400' },
            { label: 'Streak', value: `${totalCheckins}d`, icon: TrendingUp, color: 'text-violet-500' },
          ].map((stat, i) => (
            <GlassCard key={stat.label} className="p-4 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.08, type: 'spring' }}
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
              <p className="font-heading text-2xl font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </GlassCard>
          ))}
        </div>

        {/* Station ID */}
        <GlassCard variant="strong" className="p-5 mb-6 text-center">
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-heading mb-2">Station ID</p>
          <p className="font-heading text-lg font-bold tracking-wider text-violet-500">
            SYNK-{user.id?.slice(0, 8)?.toUpperCase() || '00000000'}
          </p>
        </GlassCard>

        {/* Actions */}
        <GlassButton
          variant="ghost"
          className="w-full flex items-center justify-center gap-2 text-muted-foreground"
          onClick={() => base44.auth.logout()}
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </GlassButton>
      </div>

      </PageShell>
    </div>
  );
}