import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ThreeBackground from '@/components/ThreeBackground';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import FeedPostCard from '@/components/feed/FeedPostCard';
import PageShell from '@/components/PageShell';
import MilestoneUploadModal from '@/components/milestones/MilestoneUploadModal';
import { getFanRank, getRankScore } from '@/lib/fanRank';
import { Radio, Share2, Waves } from 'lucide-react';

export default function Feed() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [filterIdol, setFilterIdol] = useState('all');

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['feedposts'],
    queryFn: () => base44.entities.FeedPost.list('-created_date', 50),
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list('-created_date'),
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones'],
    queryFn: () => base44.entities.Milestone.list('-created_date'),
  });

  // Milestones this user has not yet shared
  const userMilestones = milestones.filter(m => m.created_by === user?.email);
  const sharedIds = new Set(posts.filter(p => p.user_email === user?.email).map(p => p.milestone_id));
  const unsaredMilestones = userMilestones.filter(m => !sharedIds.has(m.id));

  const handleShareMilestone = async (milestone) => {
    const totalCheckins = goals.reduce((s, g) => s + (g.daily_checkins?.filter(c => c.completed).length || 0), 0);
    const rank = getFanRank(totalCheckins, userMilestones.length);
    await base44.entities.FeedPost.create({
      milestone_id: milestone.id,
      user_email: user.email,
      user_name: user.full_name || user.email.split('@')[0],
      idol_name: milestone.idol_name,
      idol_group: milestone.idol_group || '',
      goal_title: milestone.goal_title,
      asset_url: milestone.asset_url || '',
      asset_type: milestone.asset_type || 'badge',
      caption: milestone.caption || '',
      fan_rank: rank.id,
      cheers: [],
    });
    queryClient.invalidateQueries({ queryKey: ['feedposts'] });
    setShowShare(false);
  };

  const idols = ['all', ...new Set(posts.map(p => p.idol_name).filter(Boolean))];
  const filtered = filterIdol === 'all' ? posts : posts.filter(p => p.idol_name === filterIdol);

  if (!user) return null;

  return (
    <div className="min-h-screen relative pb-28">
      <PageShell goals={goals} user={user}>
      <ThreeBackground />

      <div className="relative z-10 px-6 pt-14">
        {/* Header */}
        <motion.div
          className="flex items-start justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          <div>
            <p className="text-xs tracking-widest uppercase text-muted-foreground font-heading mb-1">Community</p>
            <h1 className="font-display text-5xl tracking-wide uppercase text-foreground flex items-center gap-2">
              <Radio className="w-7 h-7 text-violet-400" />
              Fan Feed
            </h1>
          </div>

          {unsaredMilestones.length > 0 && (
            <GlassButton variant="primary" className="flex items-center gap-1.5 py-2 px-4 text-xs" onClick={() => setShowShare(true)}>
              <Share2 className="w-3.5 h-3.5" />
              Share
            </GlassButton>
          )}
        </motion.div>

        {/* Idol filter pills */}
        {idols.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
            {idols.map(idol => (
              <button
                key={idol}
                className={`rounded-full px-3 py-1.5 text-xs font-heading font-medium capitalize flex-shrink-0 transition-all ${
                  filterIdol === idol
                    ? 'bg-gradient-to-r from-violet-400 to-indigo-400 text-white shadow-md'
                    : 'glass-subtle text-muted-foreground'
                }`}
                onClick={() => setFilterIdol(idol)}
              >
                {idol}
              </button>
            ))}
          </div>
        )}

        {/* Posts */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="glass rounded-2xl h-64 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <GlassCard className="p-10 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
              <Waves className="w-10 h-10 text-violet-300 mx-auto mb-3" />
            </motion.div>
            <p className="font-heading font-semibold mb-1">No posts yet</p>
            <p className="text-sm text-muted-foreground mb-5">
              Be the first to share a milestone with the community!
            </p>
            {unsaredMilestones.length > 0 && (
              <GlassButton variant="primary" onClick={() => setShowShare(true)} className="mx-auto flex items-center gap-2">
                <Share2 className="w-4 h-4" /> Share Your First Milestone
              </GlassButton>
            )}
          </GlassCard>
        ) : (
          <div>
            {filtered.map((post, i) => (
              <FeedPostCard key={post.id} post={post} userEmail={user.email} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Share milestone picker */}
      <AnimatePresence>
        {showShare && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={() => setShowShare(false)} />
            <motion.div
              className="relative w-full max-w-lg mx-4 mb-4"
              initial={{ y: 300, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <GlassCard variant="strong" className="p-6 rounded-3xl" animate={false}>
                <p className="font-heading text-lg font-bold mb-1">Share to Fan Feed</p>
                <p className="text-xs text-muted-foreground mb-4">Choose a milestone to share publicly</p>
                <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
                  {unsaredMilestones.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">All milestones already shared!</p>
                  ) : (
                    unsaredMilestones.map(m => (
                      <motion.button
                        key={m.id}
                        className="w-full glass-subtle rounded-2xl p-3 flex items-center gap-3 text-left hover:ring-1 hover:ring-violet-300/60 transition-all"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleShareMilestone(m)}
                      >
                        {m.asset_url && (
                          <img src={m.asset_url} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-heading font-semibold truncate">{m.goal_title}</p>
                          <p className="text-xs text-muted-foreground">{m.idol_name}</p>
                          {m.caption && <p className="text-[10px] text-muted-foreground/60 italic truncate">"{m.caption}"</p>}
                        </div>
                        <Share2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                      </motion.button>
                    ))
                  )}
                </div>
                <GlassButton variant="ghost" onClick={() => setShowShare(false)} className="w-full mt-4">
                  Cancel
                </GlassButton>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </PageShell>
    </div>
  );
}