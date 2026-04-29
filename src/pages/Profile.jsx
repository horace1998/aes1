import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ThreeBackground from '@/components/ThreeBackground';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import PageShell from '@/components/PageShell';
import { LogOut, Shield, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import FanRankBadge from '@/components/dashboard/FanRankBadge';
import HeroImageManager from '@/components/profile/HeroImageManager';
import ReminderSettings from '@/components/profile/ReminderSettings';
import FocusManager from '@/components/profile/FocusManager';
import BiasMonogram from '@/components/profile/BiasMonogram';
import BadgeGrid from '@/components/profile/BadgeGrid';
import PhotoWall from '@/components/profile/PhotoWall';
import { evaluateBadges, buildStats } from '@/lib/badges';

export default function Profile() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list('-created_date'),
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones'],
    queryFn: () => base44.entities.Milestone.list('-created_date'),
  });

  const { data: missions = [] } = useQuery({
    queryKey: ['missions'],
    queryFn: () => base44.entities.Mission.list('-created_date', 100),
  });

  const totalCheckins = goals.reduce((sum, g) => sum + (g.daily_checkins?.filter(c => c.completed).length || 0), 0);
  const completedGoals = goals.filter(g => g.status === 'completed').length;

  const stats = buildStats({ goals, milestones, missions, userEmail: user?.email });
  const badges = evaluateBadges(stats);

  if (!user) return null;

  return (
    <div className="min-h-screen relative pb-28">
      <PageShell goals={goals} user={user}>
      <ThreeBackground />

      <div className="relative z-10 px-6 pt-14">
        {/* Profile Header */}
        <motion.div
          className="flex flex-col items-center text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          <p className="editorial-eyebrow mb-3">Station Member</p>
          <BiasMonogram biasName={user.favorite_idol} groupName={user.favorite_group} size="lg" />
          <h1 className="font-display text-3xl tracking-wide uppercase mt-4">{user.full_name || 'Station Member'}</h1>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </motion.div>

        {/* View public profile CTA */}
        <Link to={`/u/${encodeURIComponent(user.email)}`} className="block mb-6">
          <GlassButton variant="secondary" className="w-full flex items-center justify-center gap-2">
            <Eye className="w-4 h-4" /> View My Public Profile
          </GlassButton>
        </Link>

        {/* Fan Rank */}
        <FanRankBadge totalCheckins={totalCheckins} milestoneCount={milestones.length} />

        {/* Stats — editorial four-column index */}
        <div className="grid grid-cols-4 border-t border-b border-foreground/15 mb-8">
          {[
            { label: 'Goals', value: goals.length },
            { label: 'Done', value: completedGoals },
            { label: 'Entries', value: totalCheckins },
            { label: 'Streak', value: `${totalCheckins}` },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className={`text-center py-4 ${i < 3 ? 'border-r border-foreground/15' : ''}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.5 }}
            >
              <p className="font-display text-2xl text-foreground" style={{ fontWeight: 600 }}>
                {String(stat.value).padStart(2, '0')}
              </p>
              <p className="editorial-eyebrow mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Photo Wall */}
        <div className="mb-8">
          <p className="editorial-eyebrow mb-3">Milestone Wall</p>
          <PhotoWall milestones={milestones} emptyLabel="Capture your first milestone to start your wall" />
        </div>

        {/* Trophy Case */}
        <div className="mb-8">
          <BadgeGrid badges={badges} />
        </div>

        {/* Focus manager */}
        <FocusManager user={user} />

        {/* Hero Image manager */}
        <HeroImageManager user={user} />

        {/* Daily reminder */}
        <ReminderSettings />

        {/* Station ID */}
        <div className="border-t border-b border-foreground/15 py-5 mb-6 text-center">
          <p className="editorial-eyebrow mb-2">Station ID</p>
          <p className="font-display text-lg tracking-[0.2em] text-foreground" style={{ fontWeight: 600 }}>
            SYNK·{user.id?.slice(0, 8)?.toUpperCase() || '00000000'}
          </p>
        </div>

        {/* Admin */}
        {user.role === 'admin' && (
          <Link to="/admin/moderation">
            <GlassButton
              variant="ghost"
              className="w-full flex items-center justify-center gap-2 text-foreground mb-3"
            >
              <Shield className="w-4 h-4" /> Moderation Queue
            </GlassButton>
          </Link>
        )}

        {/* Actions */}
        <GlassButton
          variant="ghost"
          className="w-full flex items-center justify-center gap-2 text-muted-foreground"
          onClick={() => base44.auth.logout()}
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </GlassButton>
      </div>

      </PageShell>
    </div>
  );
}