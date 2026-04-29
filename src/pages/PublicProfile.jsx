import React from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ThreeBackground from '@/components/ThreeBackground';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import FanRankBadge from '@/components/dashboard/FanRankBadge';
import BiasMonogram from '@/components/profile/BiasMonogram';
import BadgeGrid from '@/components/profile/BadgeGrid';
import PhotoWall from '@/components/profile/PhotoWall';
import { evaluateBadges, buildStats } from '@/lib/badges';
import { ArrowLeft } from 'lucide-react';

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
        <Link to="/feed" className="inline-flex items-center gap-2 editorial-eyebrow text-foreground mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
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
        <Link to="/feed" className="inline-flex items-center gap-2 editorial-eyebrow text-foreground mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Feed
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
            <p className="editorial-eyebrow">
              Stanning <span className="text-foreground">{groupName || biasName}</span>
              {biasName && groupName ? <> · Bias <span className="text-foreground">{biasName}</span></> : null}
            </p>
          ) : (
            <p className="editorial-italic text-xs text-muted-foreground">Discovering their fandom</p>
          )}
        </motion.div>

        {/* Fan Rank */}
        <FanRankBadge totalCheckins={totalCheckins} milestoneCount={milestones.length} />

        {/* Stats — editorial four-column index */}
        <div className="grid grid-cols-4 border-t border-b border-foreground/15 mb-8">
          {[
            { label: 'Goals', value: goals.length },
            { label: 'Done', value: completedGoals },
            { label: 'Entries', value: totalCheckins },
            { label: 'Wins', value: milestones.length },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className={`text-center py-4 ${i < 3 ? 'border-r border-foreground/15' : ''}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <p className="font-display text-2xl text-foreground" style={{ fontWeight: 600 }}>
                {String(s.value).padStart(2, '0')}
              </p>
              <p className="editorial-eyebrow mt-1">{s.label}</p>
            </motion.div>
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