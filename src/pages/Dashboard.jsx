import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ThreeBackground from '@/components/ThreeBackground';
import GoalCard from '@/components/dashboard/GoalCard';
import NewGoalModal from '@/components/dashboard/NewGoalModal';
import PageShell from '@/components/PageShell';
import NotificationBell from '@/components/NotificationBell';
import FanRankBadge from '@/components/dashboard/FanRankBadge.jsx';
import TrendsSection from '@/components/dashboard/TrendsSection';
import HeroIdentity from '@/components/dashboard/HeroIdentity';
import EditorialHeader from '@/components/dashboard/EditorialHeader';
import LevelUpModal from '@/components/LevelUpModal';
import { getFanRank, getRankScore } from '@/lib/fanRank';
import { format } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (user?.onboarded === false) navigate('/onboarding');
  }, [user, navigate]);

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list('-created_date'),
  });

  const [levelUpRank, setLevelUpRank] = useState(null);

  const checkinMutation = useMutation({
    mutationFn: ({ goal, prevRankId }) => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const checkins = [...(goal.daily_checkins || []), { date: today, completed: true, note: '' }];
      return base44.entities.Goal.update(goal.id, { daily_checkins: checkins })
        .then(() => prevRankId);
    },
    onSuccess: (prevRankId) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      // Detect rank-up: recompute with one extra check-in
      const newCheckins = totalCheckins + 1;
      const newRank = getFanRank(newCheckins, milestoneCount);
      if (newRank.id !== prevRankId) {
        setLevelUpRank(newRank);
      }
    },
  });

  const completeMutation = useMutation({
    mutationFn: (goal) => base44.entities.Goal.update(goal.id, { status: 'completed', progress: 100 }),
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
  const currentRank = getFanRank(totalCheckins, milestoneCount);

  const handleCheckin = (goal) => {
    checkinMutation.mutate({ goal, prevRankId: currentRank.id });
  };

  const handleShareLevelUp = async () => {
    if (!user || !levelUpRank) return;
    await base44.entities.FeedPost.create({
      user_email: user.email,
      user_name: user.full_name || user.email.split('@')[0],
      idol_name: user.favorite_idol || 'Fan',
      idol_group: user.favorite_group || '',
      goal_title: `Reached ${levelUpRank.label} rank!`,
      caption: `Just leveled up to ${levelUpRank.label} — ${levelUpRank.description} ✨`,
      fan_rank: levelUpRank.label,
      cheers: [],
    });
    queryClient.invalidateQueries({ queryKey: ['feedPosts'] });
    setLevelUpRank(null);
    navigate('/feed');
  };

  return (
    <div className="min-h-screen relative pb-28">
      <PageShell goals={goals} user={user}>
      <ThreeBackground />

      <div className="relative z-10 px-6 pt-12">
        {/* Top utility bar — wordmark + bell + identity */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-display text-base tracking-[0.4em] text-foreground" style={{ fontWeight: 700 }}>SYNKIFY</p>
          <div className="flex items-center gap-3">
            <NotificationBell userEmail={user?.email} />
            <HeroIdentity user={user} size={40} />
          </div>
        </motion.div>

        {/* Editorial magazine header */}
        <EditorialHeader user={user} />

        {/* Fan Rank */}
        <FanRankBadge totalCheckins={totalCheckins} milestoneCount={milestoneCount} />

        {/* Stats — editorial three-column index */}
        <div className="grid grid-cols-3 mb-10 border-t border-b border-foreground/15">
          {[
            { label: 'Active', value: activeGoals.length },
            { label: 'Completed', value: completedCount },
            { label: 'Entries', value: totalCheckins },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className={`text-center py-5 ${i < 2 ? 'border-r border-foreground/15' : ''}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
            >
              <p className="font-display text-3xl text-foreground" style={{ fontWeight: 600 }}>
                {String(stat.value).padStart(2, '0')}
              </p>
              <p className="editorial-eyebrow mt-1">{stat.label}</p>
            </motion.div>
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
          <div className="flex items-center justify-between mb-5 mt-8">
            <p className="editorial-eyebrow">Chapter I — In Progress</p>
            <span className="editorial-rule flex-1 mx-4" />
            <p className="editorial-eyebrow">{String(activeGoals.length).padStart(2, '0')}</p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="glass rounded-lg h-24 animate-pulse" />
              ))}
            </div>
          ) : activeGoals.length === 0 ? (
            <div className="text-center py-10 border-t border-b border-foreground/10">
              <p className="editorial-italic text-lg text-foreground mb-1">An empty page awaits.</p>
              <p className="text-xs text-muted-foreground tracking-wider">Begin your first entry —</p>
            </div>
          ) : (
            activeGoals.map((goal, i) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                index={i}
                onCheckin={handleCheckin}
                onComplete={(g) => completeMutation.mutate(g)}
              />
            ))
          )}
        </motion.div>
      </div>

      </PageShell>

      <LevelUpModal
        isOpen={!!levelUpRank}
        rank={levelUpRank}
        score={getRankScore(totalCheckins, milestoneCount)}
        onClose={() => setLevelUpRank(null)}
        onShare={handleShareLevelUp}
      />
    </div>
  );
}