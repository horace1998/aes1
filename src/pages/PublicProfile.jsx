import React from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ThreeBackground from '@/components/ThreeBackground';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import FanRankBadge from '@/components/dashboard/FanRankBadge.jsx';
import BiasMonogram from '@/components/profile/BiasMonogram';
import BadgeGrid from '@/components/profile/BadgeGrid';
import PhotoWall from '@/components/profile/PhotoWall';
import { evaluateBadges, buildStats } from '@/lib/badges';
import { ArrowLeft, Flame, Target, CheckCircle2, Trophy } from 'lucide-react';

export default function PublicProfile() {
  const { email: rawEmail } = useParams();
  const email = decodeURIComponent(rawEmail || '');

  // Look up the public user record by email
  const { data: users = [], isLoading: loadingUser } = useQuery({
    queryKey: ['public-user', email],
    queryFn: () => base44.entities.User.filter({ email }),
    enabled: !!email,
  });
  const profileUser = users[0];

  const { data: goals = [] } = useQuery({
    queryKey: ['public-goals', email],
    queryFn: () => base44.entities.Goal.filter({ created_by: email }, '-created_date', 100),
    enabled: !!email,
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ['public-milestones', email],
    queryFn: () => base44.entities.Milestone.filter({ created_by: email }, '-created_date', 50),
    enabled: !!email,
  });

  const { data: missions = [] } = useQuery({
    queryKey: ['public-missions-all'],
    queryFn: () => base44.entities.Mission.list('-created_date', 100),
  });

  const stats = buildStats({ goals, milestones, missions, userEmail: email });
  const badges = evaluateBadges(stats);
  const completedGoals = stats.completedGoals;
  const totalCheckins = stats.totalCheckins;

  if (loadingUser) {
    return (
      <div className="min-h-screen relative pb-28 px-6 pt-14">
        <ThreeBackground />
        <div className="glass-strong rounded-3xl h-72 animate-pulse" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen relative pb-28 px-6 pt-14">
        <ThreeBackground />
        <Link to="/feed" className="inline-flex items-center gap-2 text-sm text-violet-500 mb-6 font-heading">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <GlassCard variant="strong" className="p-10 text-center">
          <p className="font-heading font-bold text-lg mb-1">Profile not found</p>
          <p className="text-xs text-muted-foreground">This member's profile is unavailable.</p>
        </GlassCard>
      </div>
    );
  }

  const displayName = profileUser.full_name || (email.split('@')[0]);
  const biasName = profileUser.favorite_idol;
  const groupName = profileUser.favorite_group;

  return (
    <div className="min-h-screen relative pb-28">
      <ThreeBackground />

      <div className="relative z-10 px-6 pt-14">
        {/* Back button */}
        <Link to="/feed" className="inline-flex items-center gap-2 text-xs text-violet-500 mb-6 font-heading">
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </Link>

        {/* Editorial header */}
        <motion.div
          className="text-center mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="editorial-eyebrow mb-2">Station Member</p>
        </motion.div>

        {/* Bias Monogram — the centerpiece */}
        <div className="flex justify-center mb-6">
          <BiasMonogram biasName={biasName} groupName={groupName} size="xl" />
        </div>

        {/* Name + handle */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="font-display text-4xl tracking-wide uppercase text-foreground">{displayName}</h1>
          <div className="editorial-rule my-3 mx-auto max-w-[120px]" />
          {biasName ? (
            <p className="text-xs text-muted-foreground font-heading tracking-wider">
              Stanning <span className="text-violet-500 font-bold">{groupName || biasName}</span>
              {biasName && groupName ? <> · Bias <span className="text-pink-500 font-bold">{biasName}</span></> : null}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground italic">Discovering their fandom</p>
          )}
        </motion.div>

        {/* Fan Rank */}
        <FanRankBadge totalCheckins={totalCheckins} milestoneCount={milestones.length} />

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          {[
            { label: 'Goals', value: goals.length, icon: Target, color: 'text-violet-400' },
            { label: 'Done', value: completedGoals, icon: CheckCircle2, color: 'text-indigo-400' },
            { label: 'Check-ins', value: totalCheckins, icon: Flame, color: 'text-pink-400' },
            { label: 'Wins', value: milestones.length, icon: Trophy, color: 'text-violet-500' },
          ].map((s, i) => (
            <GlassCard
              key={s.label}
              className="p-2.5 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
              <p className="font-heading text-lg font-bold leading-none">{s.value}</p>
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</p>
            </GlassCard>
          ))}
        </div>

        {/* Photo Wall */}
        <div className="mb-8">
          <p className="editorial-eyebrow mb-3">Milestone Wall</p>
          <PhotoWall milestones={milestones} emptyLabel="No milestones shared yet" />
        </div>

        {/* Trophy Case */}
        <div className="mb-8">
          <BadgeGrid badges={badges} />
        </div>

        {/* Footer link back */}
        <Link to="/feed" className="block">
          <GlassButton variant="ghost" className="w-full">Back to Fan Feed</GlassButton>
        </Link>
      </div>
    </div>
  );
}