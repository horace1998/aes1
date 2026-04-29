import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageShell from '@/components/PageShell';
import { ArrowLeft, MoreVertical, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FanRankBadge from '@/components/dashboard/FanRankBadge';
import BadgeGrid from '@/components/profile/BadgeGrid';
import PhotoWall from '@/components/profile/PhotoWall';
import { evaluateBadges, buildStats } from '@/lib/badges';

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
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
    <div className="min-h-screen pb-28" style={{ background: '#1a1a1a' }}>
      <PageShell goals={goals} user={user}>
        <div className="relative z-10">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pt-6 pb-4">
            <button onClick={() => navigate(-1)} className="p-2">
              <ArrowLeft className="w-5 h-5" style={{ color: '#fff' }} />
            </button>
            <button className="p-2">
              <MoreVertical className="w-5 h-5" style={{ color: '#fff' }} />
            </button>
          </div>

          {/* Hero Image Section */}
          {user.background_image_url && (
            <div className="relative -mx-5 mb-0 h-96 overflow-hidden">
              <img src={user.background_image_url} alt="hero" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
            </div>
          )}

          <div className="px-5 relative">
            {/* Avatar — positioned over hero */}
            <div className="flex justify-center -mt-20 mb-4">
              <div
                className="w-32 h-32 rounded-full border-4 border-black overflow-hidden"
                style={{
                  backgroundImage: user.profile_image_url ? `url(${user.profile_image_url})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  background: user.profile_image_url ? undefined : 'rgba(255,255,255,0.1)',
                }}
              />
            </div>

            {/* Profile Info */}
            <div className="text-center mb-6">
              <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 48, color: '#fff', fontWeight: 700, lineHeight: 1, marginBottom: 2 }}>
                {user.full_name || 'Station'}
              </h1>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
                @{user.email.split('@')[0]}
              </p>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, marginBottom: 16 }}>
                {[
                  { label: 'Followers', value: user.followers?.length || 0 },
                  { label: 'Following', value: user.following?.length || 0 },
                  { label: 'Posts', value: milestones.length },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: '#fff', fontWeight: 600 }}>
                      {String(stat.value).padStart(3, '0')}
                    </p>
                    <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Bio */}
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 16 }}>
                Dedicated K-pop fan on a journey of growth
              </p>
            </div>

            {/* Fan Rank */}
            <FanRankBadge totalCheckins={totalCheckins} milestoneCount={milestones.length} />

            {/* Achievements */}
            <div className="mb-8">
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                Achievements
              </p>
              <BadgeGrid badges={badges} />
            </div>

            {/* Gallery */}
            <div className="mb-8">
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                Posts
              </p>
              <PhotoWall milestones={milestones} />
            </div>

            {/* Sign Out */}
            <button
              onClick={() => base44.auth.logout()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </PageShell>
    </div>
  );
}