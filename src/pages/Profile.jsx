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
import ProfileImageEditor from '@/components/profile/ProfileImageEditor';
import IdentityEditor from '@/components/profile/IdentityEditor';
import ReminderSettings from '@/components/profile/ReminderSettings';
import FocusManager from '@/components/profile/FocusManager';
import BiasMonogram from '@/components/profile/BiasMonogram';
import BadgeGrid from '@/components/profile/BadgeGrid';
import PhotoWall from '@/components/profile/PhotoWall';
import { evaluateBadges, buildStats } from '@/lib/badges';

export default function Profile() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  const refreshUser = () => base44.auth.me().then(setUser);
  useEffect(() => {
    refreshUser();
  }, []);

  // Re-fetch user when 'me' query is invalidated (e.g. nickname / image updates)
  const me = queryClient.getQueryData(['me']);
  useEffect(() => {
    if (me) setUser(me);
  }, [me]);

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

      <div className="relative z-10 px-5 pt-14">
         {/* Profile Header */}
         <motion.div
           className="flex flex-col items-center text-center mb-6"
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ type: 'spring', stiffness: 200, damping: 25 }}
         >
           <p className="editorial-eyebrow mb-3">Station Member</p>
          {user.background_image_url ? (
            <div className="w-32 h-32 rounded-full overflow-hidden border border-foreground/15">
              <img src={user.background_image_url} alt="profile" className="w-full h-full object-cover" />
            </div>
          ) : (
            <BiasMonogram biasName={user.favorite_idol} groupName={user.favorite_group} size="lg" />
          )}
          <h1 className="font-display text-3xl tracking-wide uppercase mt-4" style={{ color: '#0d1117' }}>{user.full_name || 'Station Member'}</h1>
          <p className="text-xs" style={{ color: 'rgba(0,0,0,0.45)' }}>{user.email}</p>
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
        <div className="grid grid-cols-4 mb-8" style={{ borderTop: '1px solid rgba(0,0,0,0.1)', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          {[
            { label: 'Goals', value: goals.length },
            { label: 'Done', value: completedGoals },
            { label: 'Entries', value: totalCheckins },
            { label: 'Streak', value: `${totalCheckins}` },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center py-4"
              style={{ borderRight: i < 3 ? '1px solid rgba(0,0,0,0.1)' : 'none' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.5 }}
            >
              <p style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: '#0d1117', fontWeight: 600 }}>
                {String(stat.value).padStart(2, '0')}
              </p>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 8, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.38)', marginTop: 3 }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Trophy Case */}
        <div className="mb-8">
          <BadgeGrid badges={badges} />
        </div>

        {/* Identity Editor */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <IdentityEditor user={user} />
        </motion.div>

        {/* Profile Image Editor */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mb-8"
        >
          <ProfileImageEditor user={user} />
        </motion.div>

        {/* Station ID */}
        <div className="py-5 mb-6 text-center" style={{ borderTop: '1px solid rgba(0,0,0,0.1)', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', marginBottom: 8 }}>Station ID</p>
          <p style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, letterSpacing: '0.2em', color: '#0d1117', fontWeight: 600 }}>
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