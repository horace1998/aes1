import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Trophy, Heart, Flame, Sparkles, Crown, HandHeart, MessageCircle, Flag } from 'lucide-react';
import CommentsThread from '@/components/feed/CommentsThread';
import ReportDialog from '@/components/feed/ReportDialog';

const REACTIONS = [
  { id: 'heart', label: 'Heart', icon: Heart, color: 'text-pink-400' },
  { id: 'fire', label: 'Fire', icon: Flame, color: 'text-violet-400' },
  { id: 'star', label: 'Star', icon: Sparkles, color: 'text-indigo-400' },
  { id: 'crown', label: 'Crown', icon: Crown, color: 'text-violet-500' },
  { id: 'cheer', label: 'Cheer', icon: HandHeart, color: 'text-pink-500' },
];

const REACTION_MAP = REACTIONS.reduce((m, r) => { m[r.id] = r; return m; }, {});

const RANK_COLORS = {
  trainee: 'text-slate-500',
  debut: 'text-indigo-400',
  rising: 'text-violet-400',
  idol: 'text-violet-500',
  legend: 'text-pink-500',
};

export default function FeedPostCard({ post, userEmail, currentUser, index = 0 }) {
  const queryClient = useQueryClient();
  const [showPicker, setShowPicker] = useState(false);
  const [animatingReaction, setAnimatingReaction] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [localCount, setLocalCount] = useState(post.comment_count || 0);

  const cheerCounts = (post.cheers || []).reduce((acc, c) => {
    acc[c.reaction] = (acc[c.reaction] || 0) + 1;
    return acc;
  }, {});

  const userReaction = (post.cheers || []).find(c => c.user_email === userEmail)?.reaction;

  const handleReact = async (id) => {
    setShowPicker(false);
    setAnimatingReaction(id);
    setTimeout(() => setAnimatingReaction(null), 800);

    const existing = (post.cheers || []).filter(c => c.user_email !== userEmail);
    const newCheers = userReaction === id
      ? existing
      : [...existing, { user_email: userEmail, reaction: id }];
    await base44.entities.FeedPost.update(post.id, { cheers: newCheers });
    queryClient.invalidateQueries({ queryKey: ['feedposts'] });
  };

  const date = post.created_date ? format(new Date(post.created_date), 'MMM d') : '';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26, delay: index * 0.06 }}
      >
        <GlassCard variant="strong" className="overflow-hidden mb-4" animate={false}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full glass-strong flex items-center justify-center">
                <Trophy className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <p className="text-xs font-heading font-semibold">{post.user_name || post.user_email?.split('@')[0]}</p>
                {post.fan_rank && (
                  <p className={`text-[9px] font-heading ${RANK_COLORS[post.fan_rank] || 'text-muted-foreground'} uppercase tracking-wider`}>
                    {post.fan_rank}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{date}</span>
              <button
                onClick={() => setReportOpen(true)}
                className="glass-subtle rounded-full p-1.5 text-muted-foreground hover:text-pink-500 transition-colors"
                aria-label="Report"
              >
                <Flag className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Asset image */}
          {post.asset_url && (
            <div className="relative">
              <img src={post.asset_url} alt={post.goal_title} className="w-full aspect-square object-cover" />
              <AnimatePresence>
                {animatingReaction && REACTION_MAP[animatingReaction] && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 1 }}
                    exit={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.7 }}
                  >
                    {(() => {
                      const Icon = REACTION_MAP[animatingReaction].icon;
                      return <Icon className={`w-16 h-16 ${REACTION_MAP[animatingReaction].color} drop-shadow-lg`} />;
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Content */}
          <div className="px-4 pb-4 pt-3">
            <p className="text-xs text-muted-foreground font-heading mb-0.5">
              <span className="text-violet-500">{post.idol_name}</span>
              {post.idol_group ? ` · ${post.idol_group}` : ''}
            </p>
            <p className="text-sm font-heading font-semibold text-foreground mb-1">{post.goal_title}</p>
            {post.caption && (
              <p className="text-xs text-muted-foreground italic mb-3">"{post.caption}"</p>
            )}

            {/* Reactions row */}
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(cheerCounts).map(([id, count]) => {
                const r = REACTION_MAP[id];
                if (!r) return null;
                const Icon = r.icon;
                return (
                  <motion.button
                    key={id}
                    className={`glass-subtle rounded-full px-2.5 py-1 flex items-center gap-1.5 ${userReaction === id ? 'ring-1 ring-violet-300/60' : ''}`}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleReact(id)}
                  >
                    <Icon className={`w-3.5 h-3.5 ${r.color}`} />
                    <span className="text-[10px] font-heading font-semibold">{count}</span>
                  </motion.button>
                );
              })}

              <div className="relative">
                <motion.button
                  className="glass-subtle rounded-full px-3 py-1 flex items-center gap-1.5"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPicker(p => !p)}
                >
                  <Heart className="w-3 h-3 text-violet-400" />
                  <span className="text-[10px] font-heading text-muted-foreground">Cheer</span>
                </motion.button>

                <AnimatePresence>
                  {showPicker && (
                    <motion.div
                      className="absolute bottom-9 left-0 glass-strong rounded-2xl p-2 flex gap-1.5 z-20 shadow-xl"
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 10 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    >
                      {REACTIONS.map(r => {
                        const Icon = r.icon;
                        return (
                          <motion.button
                            key={r.id}
                            className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:scale-110 transition-transform"
                            onClick={() => handleReact(r.id)}
                            whileTap={{ scale: 0.85 }}
                            aria-label={r.label}
                          >
                            <Icon className={`w-4 h-4 ${r.color}`} />
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Comments toggle */}
              <motion.button
                className="glass-subtle rounded-full px-3 py-1 flex items-center gap-1.5 ml-auto"
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowComments(s => !s)}
              >
                <MessageCircle className="w-3 h-3 text-violet-400" />
                <span className="text-[10px] font-heading text-muted-foreground">{localCount}</span>
              </motion.button>
            </div>
          </div>

          {/* Comments thread */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <CommentsThread
                  postId={post.id}
                  currentUser={currentUser}
                  onCountChange={setLocalCount}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>

      <ReportDialog
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="feedpost"
        targetId={post.id}
        snapshot={`${post.goal_title} — ${post.caption || ''}`}
      />
    </>
  );
}