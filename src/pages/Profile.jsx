import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageShell from '@/components/PageShell';
import { ArrowLeft, Edit2, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FanRankBadge from '@/components/dashboard/FanRankBadge';
import BadgeGrid from '@/components/profile/BadgeGrid';
import PhotoWall from '@/components/profile/PhotoWall';
import { evaluateBadges, buildStats } from '@/lib/badges';
import GlassButton from '@/components/ui/GlassButton';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
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

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    await base44.auth.updateMe({ full_name: editName.trim() });
    setUser({ ...user, full_name: editName.trim() });
    queryClient.invalidateQueries({ queryKey: ['me'] });
    setEditOpen(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen relative pb-28" style={{ background: '#ffffff' }}>
      <PageShell goals={goals} user={user}>

        <div className="relative z-10 px-5 pt-6">
          {/* Top nav bar */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-foreground/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={() => {
                setEditName(user.full_name || '');
                setEditOpen(!editOpen);
              }}
              style={{
                padding: '8px 16px', borderRadius: 12,
                background: '#000', color: '#fff',
                fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </button>
          </div>

          {/* Edit Panel */}
          {editOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-2xl"
              style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)' }}
            >
              <div style={{ marginBottom: 12 }}>
                <label style={{ color: 'rgba(0,0,0,0.6)', fontFamily: 'Space Grotesk, sans-serif', fontSize: 10, display: 'block', marginBottom: 6 }}>Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    background: '#fff', border: '1px solid rgba(0,0,0,0.1)',
                    color: '#000', fontFamily: 'Space Grotesk, sans-serif', fontSize: 12,
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleSaveName}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 8,
                    background: '#1a3aad', border: 'none', color: '#fff',
                    fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditOpen(false)}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 8,
                    background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)',
                    color: '#000', fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* Profile Header */}
          <motion.div
            className="mb-8 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <div
                style={{
                  width: 120, height: 120, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.1)', border: '2px solid rgba(0,0,0,0.2)',
                  overflow: 'hidden',
                  backgroundImage: user.profile_image_url ? `url(${user.profile_image_url})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                }}
              />
            </div>

            {/* Name */}
            <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 42, color: '#000', fontWeight: 700, lineHeight: 1, marginBottom: 2 }}>
              {user.full_name || 'Station Member'}
            </h1>

            {/* Handle */}
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', marginBottom: 12 }}>
              @{user.email.split('@')[0]}
            </p>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderTop: '1px solid rgba(0,0,0,0.1)', borderBottom: '1px solid rgba(0,0,0,0.1)', padding: '12px 0', marginBottom: 12 }}>
              {[
                { label: 'Followers', value: user.followers?.length || 0 },
                { label: 'Following', value: user.following?.length || 0 },
                { label: 'Posts', value: milestones.length },
              ].map((stat) => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: '#000', fontWeight: 600 }}>
                    {String(stat.value).padStart(3, '0')}
                  </p>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 8, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', marginTop: 2 }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Fan Rank Badge */}
          <FanRankBadge totalCheckins={totalCheckins} milestoneCount={milestones.length} />

          {/* Achievement grid */}
          <div className="mb-8">
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', marginBottom: 12 }}>Achievements</p>
            <BadgeGrid badges={badges} />
          </div>

          {/* Photo Gallery */}
          <div className="mb-8">
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', marginBottom: 12 }}>Posts</p>
            <PhotoWall milestones={milestones} />
          </div>

          {/* Stats Summary */}
          <div className="mb-8 p-4 rounded-2xl" style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)' }}>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', marginBottom: 8 }}>About</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 14, color: 'rgba(0,0,0,0.7)', lineHeight: 1.6 }}>
              Goals completed: <strong>{completedGoals}</strong> • Daily check-ins: <strong>{totalCheckins}</strong>
            </p>
          </div>
        </div>

      </PageShell>
    </div>
  );
}