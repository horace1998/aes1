import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ThreeBackground from '@/components/ThreeBackground';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import BottomNav from '@/components/BottomNav';
import NewGoalModal from '@/components/dashboard/NewGoalModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Star, Flame, Target, LogOut, Heart } from 'lucide-react';
import FanRankBadge from '@/components/dashboard/FanRankBadge';
import { useQuery as useQueryMilestones } from '@tanstack/react-query';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list('-created_date'),
  });

  const createGoalMutation = useMutation({
    mutationFn: (data) => base44.entities.Goal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setShowNewGoal(false);
    },
  });

  const { data: milestones = [] } = useQueryMilestones({
    queryKey: ['milestones'],
    queryFn: () => base44.entities.Milestone.list('-created_date'),
  });

  const totalCheckins = goals.reduce((sum, g) => sum + (g.daily_checkins?.filter(c => c.completed).length || 0), 0);
  const completedGoals = goals.filter(g => g.status === 'completed').length;

  if (!user) return null;

  return (
    <div className="min-h-screen relative pb-28">
      <ThreeBackground />

      <div className="relative z-10 px-6 pt-14">
        {/* Profile Header */}
        <motion.div
          className="flex flex-col items-center text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          <div className="w-20 h-20 rounded-full glass-strong flex items-center justify-center mb-4 ring-2 ring-purple-500/20">
            <User className="w-8 h-8 text-purple-500" />
          </div>
          <h1 className="font-heading text-2xl font-bold">{user.full_name || 'Station Member'}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {user.favorite_idol && (
            <div className="flex items-center gap-1.5 mt-2 glass-subtle rounded-full px-3 py-1">
              <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
              <span className="text-xs font-heading">{user.favorite_idol}</span>
            </div>
          )}
        </motion.div>

        {/* Fan Rank */}
        <FanRankBadge totalCheckins={totalCheckins} milestoneCount={milestones.length} />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { label: 'Total Goals', value: goals.length, icon: Target, color: 'text-purple-500' },
            { label: 'Completed', value: completedGoals, icon: Star, color: 'text-teal-500' },
            { label: 'Check-ins', value: totalCheckins, icon: Flame, color: 'text-orange-400' },
            { label: 'Streak', value: `${totalCheckins}d`, icon: Flame, color: 'text-pink-500' },
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
          <p className="font-heading text-lg font-bold tracking-wider text-purple-500">
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

      <BottomNav onAddGoal={() => setShowNewGoal(true)} />
      <NewGoalModal
        isOpen={showNewGoal}
        onClose={() => setShowNewGoal(false)}
        onSave={(data) => createGoalMutation.mutate(data)}
        defaultIdol={user ? { idol_name: user.favorite_idol, idol_group: user.favorite_group } : null}
      />
    </div>
  );
}