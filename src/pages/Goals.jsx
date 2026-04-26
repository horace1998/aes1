import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ThreeBackground from '@/components/ThreeBackground';
import GlassCard from '@/components/ui/GlassCard';
import GoalCard from '@/components/dashboard/GoalCard';
import NewGoalModal from '@/components/dashboard/NewGoalModal';
import PageShell from '@/components/PageShell';
import { format } from 'date-fns';

const TABS = ['active', 'completed', 'all'];

export default function Goals() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('active');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: goals = [] } = useQuery({
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

  const filtered = activeTab === 'all' ? goals : goals.filter(g => g.status === activeTab);

  return (
    <div className="min-h-screen relative pb-28">
      <PageShell goals={goals} user={user}>
      <ThreeBackground />

      <div className="relative z-10 px-6 pt-14">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-heading text-3xl font-bold text-foreground mb-6">My Goals</h1>
        </motion.div>

        {/* Tabs */}
        <div className="glass rounded-xl p-1 flex mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              className="relative flex-1 py-2 text-xs font-heading font-medium capitalize"
              onClick={() => setActiveTab(tab)}
            >
              {activeTab === tab && (
                <motion.div
                  className="absolute inset-0 glass-strong rounded-lg"
                  layoutId="goalTab"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`relative z-10 ${activeTab === tab ? 'text-foreground' : 'text-muted-foreground'}`}>
                {tab} ({(tab === 'all' ? goals : goals.filter(g => g.status === tab)).length})
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {filtered.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <p className="text-muted-foreground text-sm">No {activeTab} goals yet</p>
              </GlassCard>
            ) : (
              filtered.map((goal, i) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  index={i}
                  onCheckin={(g) => checkinMutation.mutate(g)}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      </PageShell>
    </div>
  );
}