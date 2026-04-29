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
import FanRankBadge from '@/components/dashboard/FanRankBadge';
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
    <div className="min-h-screen relative pb-32" style={{ background: '#ffffff' }}>
      <PageShell goals={goals} user={user}>

      <div className="relative z-10 px-5 pt-[3.5rem]">
        {/* Top utility bar */}
        <motion.div
          className="flex items-center justify-end mb-1 pt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <NotificationBell userEmail={user?.email} />
            <HeroIdentity user={user} size={34} />
          </div>
        </motion.div>

        {/* Poster header */}
        <EditorialHeader user={user} />

        {/* Fan Rank */}
        <FanRankBadge totalCheckins={totalCheckins} milestoneCount={milestoneCount} />

        {/* Stats — filmstrip style */}
        <div className="grid grid-cols-3 mb-8" style={{ gap: 8 }}>
          {[
            { label: 'Active', value: activeGoals.length },
            { label: 'Completed', value: completedCount },
            { label: 'Entries', value: totalCheckins },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              style={{
                borderRadius: 12,
                background: 'rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.07)',
                padding: '14px 10px',
                textAlign: 'center',
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.07, duration: 0.45 }}
            >
              <p style={{
                fontFamily: 'Bebas Neue, Impact, sans-serif',
                fontSize: 34, color: '#0d1117', lineHeight: 1, letterSpacing: '0.03em',
              }}>
                {String(stat.value).padStart(2, '0')}
              </p>
              <p style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 9, fontWeight: 700, letterSpacing: '0.28em',
                textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)', marginTop: 5,
              }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trends */}
        {goals.length > 0 && <TrendsSection goals={goals} />}

        {/* Active Goals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28 }}
        >
          {/* Section label */}
          <div className="flex items-center gap-3 mb-4">
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 9, fontWeight: 700, letterSpacing: '0.35em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
            }}>
              Chapter I — In Progress
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.1)' }} />
            <span style={{
              fontFamily: 'Bebas Neue, sans-serif', fontSize: 16,
              color: '#1a3aad', letterSpacing: '0.05em',
            }}>
              {String(activeGoals.length).padStart(2, '0')}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} style={{
                  height: 96, borderRadius: 16,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              ))}
            </div>
          ) : activeGoals.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '32px 0',
              borderTop: '1px solid rgba(0,0,0,0.08)',
              borderBottom: '1px solid rgba(0,0,0,0.08)',
            }}>
              {/* iMessage style empty state */}
              <div className="inline-block chat-bubble-in mb-3" style={{ fontSize: 13 }}>
                An empty page awaits.
              </div>
              <p style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 11, color: 'rgba(0,0,0,0.35)', letterSpacing: '0.2em',
              }}>
                Begin your first entry —
              </p>
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