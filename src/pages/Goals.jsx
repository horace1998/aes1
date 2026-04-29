import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
  const scrollRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
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

  const completeMutation = useMutation({
    mutationFn: (goal) => base44.entities.Goal.update(goal.id, { status: 'completed', progress: 100 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });

  const filtered = activeTab === 'all' ? goals : goals.filter(g => g.status === activeTab);

  return (
    <div className="min-h-screen relative pb-28">
      <PageShell goals={goals} user={user}>
      <ThreeBackground />

      <div className="relative z-10 px-6 pt-[3.5rem]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-5xl tracking-wide uppercase text-foreground mb-6">My Goals</h1>
        </motion.div>

        {/* Tabs */}
        <div className="border border-foreground/10 rounded-xl p-1 flex mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              className="relative flex-1 py-2 text-xs font-heading font-medium capitalize"
              onClick={() => { setActiveTab(tab); window.scrollTo({ top: 0, behavior: 'instant' }); }}
            >
              {activeTab === tab && (
                <motion.div
                  className="absolute inset-0 bg-foreground rounded-lg"
                  layoutId="goalTab"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`relative z-10 ${activeTab === tab ? 'text-background' : 'text-muted-foreground'}`}>
                {tab} ({(tab === 'all' ? goals : goals.filter(g => g.status === tab)).length})
              </span>
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
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
                onComplete={(g) => completeMutation.mutate(g)}
              />
            ))
          )}
        </motion.div>
      </div>

      </PageShell>
    </div>
  );
}