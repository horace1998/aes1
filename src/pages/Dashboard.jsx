import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ThreeBackground from '@/components/ThreeBackground';
import GlassCard from '@/components/ui/GlassCard';
import GoalCard from '@/components/dashboard/GoalCard';
import NewGoalModal from '@/components/dashboard/NewGoalModal';
import BottomNav from '@/components/BottomNav';
import { Sparkles, Flame } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u.onboarded) {
        navigate('/onboarding');
      }
      setUser(u);
    });
  }, [navigate]);

  const { data: goals = [], isLoading } = useQuery({
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

  const checkinMutation = useMutation({
    mutationFn: (goal) => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const checkins = [...(goal.daily_checkins || []), { date: today, completed: true, note: '' }];
      return base44.entities.Goal.update(goal.id, { daily_checkins: checkins });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedCount = goals.filter(g => g.status === 'completed').length;
  const totalCheckins = goals.reduce((sum, g) => sum + (g.daily_checkins?.filter(c => c.completed).length || 0), 0);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen relative pb-28">
      <ThreeBackground />

      <div className="relative z-10 px-6 pt-14">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          <p className="text-sm text-muted-foreground">{greeting()}</p>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {user.full_name?.split(' ')[0] || 'Station'}
          </h1>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Active', value: activeGoals.length, icon: Sparkles, color: 'text-purple-500' },
            { label: 'Completed', value: completedCount, icon: Flame, color: 'text-teal-500' },
            { label: 'Check-ins', value: totalCheckins, icon: Flame, color: 'text-orange-400' },
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

        {/* Active Goals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs tracking-widest uppercase text-muted-foreground font-heading mb-4">
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
              <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-3" />
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