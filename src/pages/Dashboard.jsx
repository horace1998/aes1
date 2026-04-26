import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ThreeBackground from '@/components/ThreeBackground';
import GlassCard from '@/components/ui/GlassCard';
import GoalCard from '@/components/dashboard/GoalCard';
import NewGoalModal from '@/components/dashboard/NewGoalModal';
import PageShell from '@/components/PageShell';
import { Target, Flame, CheckCircle2 } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import FanRankBadge from '@/components/dashboard/FanRankBadge';
import TrendsSection from '@/components/dashboard/TrendsSection';
import { format } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Only redirect if explicitly set to false, not just undefined (first-time users handled gracefully)
      if (u.onboarded === false) {
        navigate('/onboarding');
      }
    });
  }, [navigate]);

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list('-created_date'),
  });

  const checkinMutation = useMutation({
    mutationFn: (goal) => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const checkins = [...(goal.daily_checkins || []), { date: today, completed: true, note: '' }];
      return base44.entities.Goal.update(goal.id, { daily_checkins: checkins });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones'],
    queryFn: () => base44.entities.Milestone.list('-created_date'),
  });

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedCount = goals.filter(g => g.status === 'completed').length;
  const totalCheckins = goals.reduce((sum, g) => sum + (g.daily_checkins?.filter(c => c.completed).length || 0), 0);
  const milestoneCount = milestones.length;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen relative pb-28">
      <PageShell goals={goals} user={user}>
      <ThreeBackground />

      <div className="relative z-10 px-6 pt-14">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{greeting()}</p>
              <h1 className="font-heading text-3xl font-bold text-foreground">
                {user.full_name?.split(' ')[0] || 'Station'}
              </h1>
            </div>
            <NotificationBell userEmail={user.email} />
          </div>
        </motion.div>

        {/* Fan Rank */}
        <FanRankBadge totalCheckins={totalCheckins} milestoneCount={milestoneCount} />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Active', value: activeGoals.length, icon: Target, color: 'text-sky-500' },
            { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'text-cyan-500' },
            { label: 'Check-ins', value: totalCheckins, icon: Flame, color: 'text-blue-500' },
          ].map((stat, i) => (
            <GlassCard key={stat.label} variant="default" className="p-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, type: 'spring' }}
            >
              <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
              <p className="font-heading text-2xl font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </GlassCard>
          ))}
        </div>

        {/* Trends */}
        {goals.length > 0 && <TrendsSection goals={goals} />}

        {/* Active Goals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs tracking-widest uppercase text-muted-foreground font-heading mb-4 mt-6">
            Active Goals
          </p>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="glass rounded-2xl h-32 animate-pulse" />
              ))}
            </div>
          ) : activeGoals.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Target className="w-8 h-8 text-sky-400 mx-auto mb-3" />
              <p className="font-heading font-semibold mb-1">No active goals</p>
              <p className="text-sm text-muted-foreground">Tap + to create your first goal</p>
            </GlassCard>
          ) : (
            activeGoals.map((goal, i) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                index={i}
                onCheckin={(g) => checkinMutation.mutate(g)}
              />
            ))
          )}
        </motion.div>
      </div>

      </PageShell>
    </div>
  );
}