import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Flame, Star } from 'lucide-react';

const REACTIONS = [
  { emoji: '💜', label: 'Purple Heart' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '⭐', label: 'Star' },
  { emoji: '👑', label: 'Crown' },
  { emoji: '🫶', label: 'Cheer' },
];

const RANK_COLORS = {
  trainee: 'text-slate-500',
  debut: 'text-teal-500',
  rising: 'text-blue-500',
  idol: 'text-purple-500',
  legend: 'text-orange-500',
};

export default function FeedPostCard({ post, userEmail, index = 0 }) {
  const queryClient = useQueryClient();
  const [showPicker, setShowPicker] = useState(false);
  const [animatingReaction, setAnimatingReaction] = useState(null);

  const cheerCounts = (post.cheers || []).reduce((acc, c) => {
    acc[c.reaction] = (acc[c.reaction] || 0) + 1;
    return acc;
  }, {});

  const userReaction = (post.cheers || []).find(c => c.user_email === userEmail)?.reaction;

  const handleReact = async (emoji) => {
    setShowPicker(false);
    setAnimatingReaction(emoji);
    setTimeout(() => setAnimatingReaction(null), 800);

    const existing = (post.cheers || []).filter(c => c.user_email !== userEmail);
    const newCheers = userReaction === emoji
      ? existing // toggle off
      : [...existing, { user_email: userEmail, reaction: emoji }];
    await base44.entities.FeedPost.update(post.id, { cheers: newCheers });
    queryClient.invalidateQueries({ queryKey: ['feedposts'] });
  };

  const date = post.created_date ? format(new Date(post.created_date), 'MMM d') : '';

  return (
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
              <Star className="w-4 h-4 text-purple-400" />
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
          <span className="text-[10px] text-muted-foreground">{date}</span>
        </div>

        {/* Asset image */}
        {post.asset_url && (
          <div className="relative">
            <img src={post.asset_url} alt={post.goal_title} className="w-full aspect-square object-cover" />
            {/* Floating reaction animation */}
            <AnimatePresence>
              {animatingReaction && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 1 }}
                  exit={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.7 }}
                >
                  <span className="text-5xl">{animatingReaction}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Content */}
        <div className="px-4 pb-4 pt-3">
          <p className="text-xs text-muted-foreground font-heading mb-0.5">
            <span className="text-purple-500">{post.idol_name}</span>
            {post.idol_group ? ` · ${post.idol_group}` : ''}
          </p>
          <p className="text-sm font-heading font-semibold text-foreground mb-1">{post.goal_title}</p>
          {post.caption && (
            <p className="text-xs text-muted-foreground italic mb-3">"{post.caption}"</p>
          )}

          {/* Reactions row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Existing reactions */}
            {Object.entries(cheerCounts).map(([emoji, count]) => (
              <motion.button
                key={emoji}
                className={`glass-subtle rounded-full px-2.5 py-1 flex items-center gap-1 ${userReaction === emoji ? 'ring-1 ring-purple-400/50' : ''}`}
                whileTap={{ scale: 0.85 }}
                onClick={() => handleReact(emoji)}
              >
                <span className="text-sm">{emoji}</span>
                <span className="text-[10px] font-heading font-semibold">{count}</span>
              </motion.button>
            ))}

            {/* Add reaction button */}
            <div className="relative">
              <motion.button
                className="glass-subtle rounded-full px-3 py-1 flex items-center gap-1.5"
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowPicker(p => !p)}
              >
                <Flame className="w-3 h-3 text-orange-400" />
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
                    {REACTIONS.map(r => (
                      <motion.button
                        key={r.emoji}
                        className="w-9 h-9 rounded-xl glass flex items-center justify-center text-xl hover:scale-110 transition-transform"
                        onClick={() => handleReact(r.emoji)}
                        whileTap={{ scale: 0.85 }}
                      >
                        {r.emoji}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}