import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Send, Loader2, Reply as ReplyIcon } from 'lucide-react';
import { toast } from 'sonner';
import { moderate } from '@/lib/moderation';

export default function StoryReplies({ storyId, currentUser }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [sending, setSending] = useState(false);
  const queryClient = useQueryClient();

  const { data: replies = [], isLoading } = useQuery({
    queryKey: ['story-replies', storyId],
    queryFn: () => base44.entities.Comment.filter(
      { post_id: storyId, moderation_status: 'approved' },
      '-created_date',
      50
    ),
    enabled: !!storyId && showReplies,
  });

  const handleReply = async () => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    
    setSending(true);
    try {
      const verdict = await moderate(trimmed, 'comment');
      if (!verdict.ok) {
        toast.error(verdict.reason || 'Reply blocked');
        setSending(false);
        return;
      }

      await base44.entities.Comment.create({
        post_id: storyId,
        parent_comment_id: replyingTo?.id || null,
        user_email: currentUser.email,
        user_name: currentUser.full_name || currentUser.email.split('@')[0],
        content: trimmed,
        moderation_status: 'approved',
      });

      setReplyText('');
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey: ['story-replies', storyId] });
      toast.success('Reply sent 💜');
    } catch (e) {
      toast.error('Could not send reply');
    }
    setSending(false);
  };

  const ReplyThread = ({ reply, replies, replyingTo, onReply }) => {
    const childReplies = replies.filter(r => r.parent_comment_id === reply.id);
    return (
      <motion.div
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-2"
      >
        <div
          className="p-2 rounded-lg"
          style={{
            background: 'rgba(0,0,0,0.02)',
            border: '1px solid rgba(0,0,0,0.04)',
          }}
        >
          <div className="flex items-start justify-between mb-1">
            <p style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 10,
              fontWeight: 600,
              color: '#1a3aad',
            }}>
              {reply.user_name || reply.user_email?.split('@')[0]}
            </p>
            <p style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 8,
              color: 'rgba(0,0,0,0.35)',
              letterSpacing: '0.1em',
            }}>
              {formatDistanceToNow(new Date(reply.created_date), { addSuffix: true })}
            </p>
          </div>
          <p style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 12,
            color: '#0d1117',
            lineHeight: 1.4,
            marginBottom: 6,
          }}>
            {reply.content}
          </p>
          <button
            onClick={() => onReply(reply)}
            className="flex items-center gap-1 text-[9px] text-primary/60 hover:text-primary transition-colors"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 600,
              letterSpacing: '0.1em',
            }}
          >
            <ReplyIcon className="w-2.5 h-2.5" /> Reply
          </button>
        </div>
        {childReplies.length > 0 && (
          <div className="ml-4 space-y-2 border-l-2 border-foreground/10 pl-2">
            {childReplies.map(child => (
              <ReplyThread key={child.id} reply={child} replies={replies} replyingTo={replyingTo} onReply={onReply} />
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="mt-3 pt-3 border-t border-foreground/10">
      <button
        onClick={() => setShowReplies(!showReplies)}
        className="flex items-center gap-1.5 text-xs"
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 600,
          color: 'rgba(0,0,0,0.5)',
          letterSpacing: '0.15em',
        }}
      >
        <MessageCircle className="w-3.5 h-3.5" />
        {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
      </button>

      <AnimatePresence>
        {showReplies && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-4 h-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
              </div>
            ) : replies.length > 0 ? (
              <div className="space-y-2 mb-3 max-h-64 overflow-y-auto">
                {replies.filter(r => !r.parent_comment_id).map(r => (
                  <ReplyThread key={r.id} reply={r} replies={replies} replyingTo={replyingTo} onReply={setReplyingTo} />
                ))}
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              {replyingTo && (
                <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                  <p style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#1a3aad',
                  }}>
                    Replying to {replyingTo.user_name || replyingTo.user_email?.split('@')[0]}
                  </p>
                  <button onClick={() => setReplyingTo(null)} className="text-primary/60 hover:text-primary text-xs">✕</button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value.slice(0, 240))}
                  placeholder="Reply…"
                  maxLength={240}
                  className="flex-1 px-2.5 py-1.5 rounded-lg text-xs focus:outline-none"
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    background: 'rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    color: '#0d1117',
                  }}
                />
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim() || sending}
                  className="px-2.5 py-1.5 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, #1a3aad, #0d1f6b)',
                    color: '#fff',
                    opacity: !replyText.trim() || sending ? 0.5 : 1,
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    cursor: !replyText.trim() || sending ? 'not-allowed' : 'pointer',
                  }}
                >
                  {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}