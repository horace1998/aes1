import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ThreeBackground from '@/components/ThreeBackground';
import PageShell from '@/components/PageShell';
import { LogOut, Shield, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import FanRankBadge from '@/components/dashboard/FanRankBadge';
import BadgeGrid from '@/components/profile/BadgeGrid';
import PhotoWall from '@/components/profile/PhotoWall';
import { evaluateBadges, buildStats } from '@/lib/badges';
import GlassButton from '@/components/ui/GlassButton';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
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
    <div className="min-h-screen relative pb-28" style={{ background: '#1a1a1a' }}>
      <PageShell goals={goals} user={user}>
        <ThreeBackground />

        <div className="relative z-10 px-5 pt-6">
          {/* Top nav bar */}
          <div className="flex items-center justify-between mb-8">
            <div />
            <button
              onClick={() => setEditOpen(!editOpen)}
              style={{
                padding: '8px 16px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Settings className="w-3.5 h-3.5" /> Settings
            </button>
          </div>

          {/* Edit Panel */}
          {editOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <p style={{ color: '#fff', fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, marginBottom: 12 }}>Edit Profile (save via Settings)</p>
              {/* Placeholder for edit controls — import EditProfile component if needed */}
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Profile editing interface goes here</div>
            </motion.div>
          )}

          {/* Header with background */}
          {user.background_image_url && (
            <div className="relative -mx-5 mb-8 h-64 rounded-b-3xl overflow-hidden">
              <img src={user.background_image_url} alt="profile-bg" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
            </div>
          )}

          {/* Profile info — dark card */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="p-6 rounded-3xl text-center"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {/* Handle */}
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>
                @{user.email.split('@')[0]}
              </p>

              {/* Name */}
              <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 48, color: '#fff', fontWeight: 700, lineHeight: 1, marginBottom: 8 }}>
                {user.full_name || 'Station Member'}
              </h1>

              {/* Bio */}
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
                Dedicated K-pop fan on a journey of growth
              </p>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '12px 0' }}>
                {[
                  { label: 'Followers', value: user.followers?.length || 0 },
                  { label: 'Following', value: user.following?.length || 0 },
                  { label: 'Posts', value: milestones.length },
                ].map((stat) => (
                  <div key={stat.label} style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: '#fff', fontWeight: 600 }}>
                      {String(stat.value).padStart(3, '0')}
                    </p>
                    <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 8, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Fan Rank Badge */}
          <FanRankBadge totalCheckins={totalCheckins} milestoneCount={milestones.length} />

          {/* Achievement grid */}
          <div className="mb-8">
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>Trophy Case</p>
            <BadgeGrid badges={badges} />
          </div>

          {/* Photo Gallery */}
          <div className="mb-8">
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>Posts</p>
            <PhotoWall milestones={milestones} />
          </div>

          {/* Admin link */}
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
            className="w-full flex items-center justify-center gap-2"
            onClick={() => base44.auth.logout()}
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </GlassButton>
        </div>
      </PageShell>
    </div>
  );
}