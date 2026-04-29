import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import EditorialHeader from '@/components/dashboard/EditorialHeader';
import LevelUpModal from '@/components/LevelUpModal';
import CheerInbox from '@/components/circle/CheerInbox';
import HomeSplash from '@/components/dashboard/HomeSplash';
import { leaveGoal } from '@/lib/leaveGoal';
import { getFanRank, getRankScore } from '@/lib/fanRank';
import { format, parseISO, isSameDay } from 'date-fns';
import { Calendar, Clock, CheckCircle2, Circle, Share2 } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

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
    mutationFn: async (goal) => {
      await base44.entities.Goal.update(goal.id, { status: 'completed', progress: 100 });
      // If linked to a mission and user isn't the creator, also remove from members list
      if (goal.mission_id) {
        try {
          const mission = await base44.entities.Mission.get(goal.mission_id);
          if (mission && mission.creator_email !== user?.email) {
            await base44.functions.invoke('leaveMission', { mission_id: goal.mission_id });
          }
        } catch {}
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (goal) => leaveGoal(goal, user?.email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones'],
    queryFn: () => base44.entities.Milestone.list('-created_date'),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-due_date'),
  });

  const [selectedDate, setSelectedDate] = useState(new Date());

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedCount = goals.filter(g => g.status === 'completed').length;
  const totalCheckins = goals.reduce((sum, g) => sum + (g.daily_checkins?.filter(c => c.completed).length || 0), 0);
  const milestoneCount = milestones.length;
  const currentRank = getFanRank(totalCheckins, milestoneCount);
  const canAddGoal = activeGoals.length < 3;

  const handleCheckin = (goal) => {
    checkinMutation.mutate({ goal, prevRankId: currentRank.id });
  };

  const handleDeleteGoal = (goal) => {
    deleteGoalMutation.mutate(goal);
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
      <HomeSplash />
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
          </div>
        </motion.div>

        {/* Poster header */}
        <EditorialHeader user={user} />

        {/* Fan Rank */}
        <FanRankBadge totalCheckins={totalCheckins} milestoneCount={milestoneCount} idolImageUrl={user?.background_image_url} hologram />

        {/* Cheers received from circle members */}
        <CheerInbox user={user} />

        {/* Current Goal Quick View */}
        {activeGoals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 9, fontWeight: 700, letterSpacing: '0.35em',
                textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)',
              }}>
                Active Mission
              </span>
            </div>
            <GlassCard variant="strong" className="p-4" animate={false}>
              <p className="text-xs text-muted-foreground mb-1">{activeGoals[0].idol_group || activeGoals[0].idol_name}</p>
              <p className="font-heading text-sm font-bold text-foreground">{activeGoals[0].title}</p>
            </GlassCard>
          </motion.div>
        )}

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

        {/* Tasks Calendar + List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 9, fontWeight: 700, letterSpacing: '0.35em',
              textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)',
            }}>
              Planning
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.1)' }} />
          </div>

          {/* Minimal Calendar — just current week */}
          <GlassCard variant="strong" className="p-4 mb-4" animate={false}>
            <div className="flex gap-1.5">
              {[...Array(7)].map((_, i) => {
                const date = new Date(selectedDate);
                const firstDay = new Date(selectedDate.setDate(selectedDate.getDate() - selectedDate.getDay()));
                const weekDate = new Date(firstDay);
                weekDate.setDate(weekDate.getDate() + i);

                const isSelected = isSameDay(weekDate, selectedDate);
                const dayTasks = tasks.filter(t => t.due_date && isSameDay(parseISO(t.due_date), weekDate));

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(weekDate)}
                    className={`flex-1 rounded-lg p-2 text-center transition-all border ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-foreground/10 text-foreground hover:bg-foreground/5'
                    }`}
                  >
                    <p className="text-[10px] font-heading font-bold">{format(weekDate, 'EEE').slice(0, 2)}</p>
                    <p className="text-xs font-heading mt-0.5">{format(weekDate, 'd')}</p>
                    {dayTasks.length > 0 && (
                      <p className="text-[8px] mt-1" style={{ opacity: 0.6 }}>{dayTasks.length} tasks</p>
                    )}
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* Tasks for selected date */}
          {tasks.filter(t => t.due_date && isSameDay(parseISO(t.due_date), selectedDate)).length > 0 ? (
            <div className="space-y-2">
              {tasks.filter(t => t.due_date && isSameDay(parseISO(t.due_date), selectedDate)).map(task => (
                <GlassCard
                  key={task.id}
                  variant={task.status === 'done' ? 'subtle' : 'strong'}
                  className="p-3 flex items-start gap-3"
                  animate={false}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {task.status === 'done' ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <Circle className="w-5 h-5 text-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-heading ${
                      task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'
                    }`}>
                      {task.title}
                    </p>
                    {task.due_time && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {task.due_time}
                      </p>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center', padding: '16px',
              borderRadius: 12, background: 'rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.07)',
            }}>
              <p style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 12, color: 'rgba(0,0,0,0.35)',
              }}>
                No tasks for this date
              </p>
            </div>
          )}
        </motion.div>

        {/* Milestones grid */}
        {milestones.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.42 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <span style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 9, fontWeight: 700, letterSpacing: '0.35em',
                textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)',
              }}>
                Moments
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.1)' }} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {milestones.slice(0, 6).map(m => (
                <div key={m.id} className="rounded-xl overflow-hidden border border-foreground/10">
                  {m.asset_url && (
                    <img src={m.asset_url} alt="" className="w-full aspect-square object-cover" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

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
                  background: 'rgba(0,0,0,0.03)',
                  border: '1px solid rgba(0,0,0,0.07)',
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
            <>
              {activeGoals.map((goal, i) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  index={i}
                  onCheckin={handleCheckin}
                  onComplete={(g) => completeMutation.mutate(g)}
                  onDelete={() => handleDeleteGoal(goal)}
                />
              ))}
              {!canAddGoal && (
                <div style={{
                  marginTop: 12, padding: '10px 14px',
                  background: 'rgba(255,180,0,0.08)', border: '1px solid rgba(255,180,0,0.2)',
                  borderRadius: 12, textAlign: 'center',
                  fontFamily: 'Space Grotesk, sans-serif', fontSize: 11,
                  color: 'rgba(0,0,0,0.6)',
                }}>
                  Max 3 active goals — complete or delete one to add more
                </div>
              )}
            </>
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