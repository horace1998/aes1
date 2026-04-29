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
import EditProfile from '@/components/profile/EditProfile';
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
          {/* Header with background image overlay */}
          {user.background_image_url ? (
            <div className="relative -mx-5 mb-8 h-56 rounded-b-3xl overflow-hidden">
              <img src={user.background_image_url} alt="profile-bg" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/80" />
            </div>
          ) : null}

          {/* Edit Profile button (top right) */}
          <div className="flex justify-between items-start mb-6 -mt-12 relative z-10">
            <div />
            <EditProfile user={user} />
          </div>

          {/* Profile info card — merged layout */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <GlassCard variant="strong" className="p-6 rounded-3xl">
              {/* Profile header with handle */}
              <div className="text-center mb-4">
                <h1 className="font-display text-3xl tracking-wide uppercase mb-2" style={{ color: '#0d1117' }}>
                  {user.full_name || 'Station Member'}
                </h1>
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase' }}>
                  @{user.email.split('@')[0]}
                </p>
              </div>

              {/* Bio / description placeholder */}
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 13, color: 'rgba(0,0,0,0.6)', textAlign: 'center', marginBottom: 12 }}>
                Dedicated K-pop fan on a journey of growth
              </p>

              {/* Followers / Following / Creations stats */}
              <div className="grid grid-cols-3 gap-0 mb-4" style={{ borderTop: '1px solid rgba(0,0,0,0.08)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                {[
                  { label: 'Followers', value: user.followers?.length || 0 },
                  { label: 'Following', value: user.following?.length || 0 },
                  { label: 'Creations', value: milestones.length },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="text-center py-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.08 + i * 0.05 }}
                  >
                    <p style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: '#0d1117', fontWeight: 600 }}>
                      {String(stat.value).padStart(3, '0')}
                    </p>
                    <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 8, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.38)', marginTop: 2 }}>
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Profile Visibility Toggle */}
              <motion.div
                className="flex items-center justify-between p-3 rounded-xl bg-foreground/5 border border-foreground/10 mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.24 }}
              >
                <div>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 10, fontWeight: 700, color: '#0d1117' }}>
                    PROFILE VISIBILITY
                  </p>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 8, color: 'rgba(0,0,0,0.5)', marginTop: 2 }}>
                    {user.profile_visibility === 'public' ? '✓ Public' : '🔒 Private'}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await base44.auth.updateMe({
                      profile_visibility: user.profile_visibility === 'public' ? 'private' : 'public',
                    });
                    setUser({ ...user, profile_visibility: user.profile_visibility === 'public' ? 'private' : 'public' });
                  }}
                  style={{
                    width: 48, height: 28, borderRadius: 14,
                    background: user.profile_visibility === 'public' ? '#1a3aad' : '#ccc',
                    border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.3s',
                  }}
                >
                  <motion.div
                    animate={{ x: user.profile_visibility === 'public' ? 20 : 2 }}
                    style={{ width: 24, height: 24, borderRadius: 12, background: 'white', position: 'absolute', top: 2, left: 2 }}
                  />
                </button>
              </motion.div>

              {/* View public profile link */}
              {user.profile_visibility === 'public' && (
                <Link to={`/u/${encodeURIComponent(user.email)}`} className="block">
                  <GlassButton variant="secondary" className="w-full flex items-center justify-center gap-2 text-sm">
                    <Eye className="w-4 h-4" /> See Profile
                  </GlassButton>
                </Link>
              )}
            </GlassCard>
          </motion.div>

          {/* Fan Rank — dedicated section */}
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

          {/* Photo Wall */}
          <div className="mb-8">
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', marginBottom: 12 }}>Milestone Wall</p>
            <PhotoWall milestones={milestones} />
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

          {/* Sign out */}
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