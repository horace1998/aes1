import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Share2, X, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * LevelUpModal — celebration overlay shown when a user's fan rank increases.
 * Props:
 *  - isOpen: boolean
 *  - rank: { label, description, color, textColor } — the new rank
 *  - score: number — current rank score
 *  - onClose: () => void
 *  - onShare: () => void  — share to feed
 */
export default function LevelUpModal({ isOpen, rank, score, onClose, onShare }) {
  useEffect(() => {
    if (!isOpen) return;
    // Burst of confetti
    const end = Date.now() + 800;
    const colors = ['#c4b5fd', '#f9a8d4', '#bae6fd', '#a78bfa'];
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 65,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 65,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && rank && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: 'rgba(40,30,80,0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            className="glass-strong rounded-3xl p-7 max-w-sm w-full relative overflow-hidden"
            initial={{ scale: 0.8, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full glass-subtle flex items-center justify-center hover:bg-white/60 transition"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Animated badge */}
            <div className="flex flex-col items-center text-center">
              <motion.div
                className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${rank.color} flex items-center justify-center shadow-xl mb-4`}
                initial={{ rotate: -15, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 14, delay: 0.1 }}
              >
                <Trophy className="w-12 h-12 text-white" strokeWidth={2} />
                <motion.div
                  className="absolute"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-32 h-32 text-white/30" />
                </motion.div>
              </motion.div>

              <motion.p
                className="text-xs tracking-[0.25em] uppercase text-muted-foreground font-heading mb-1"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                Level Up
              </motion.p>
              <motion.h2
                className={`font-display text-4xl tracking-wide uppercase ${rank.textColor} mb-1`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {rank.label}
              </motion.h2>
              <motion.p
                className="text-sm text-muted-foreground mb-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {rank.description}
              </motion.p>

              <motion.div
                className="glass-subtle rounded-2xl px-4 py-2 mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 }}
              >
                <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-heading">
                  Rank Score
                </p>
                <p className="font-heading font-bold text-2xl text-foreground">{score}</p>
              </motion.div>

              <motion.div
                className="flex gap-2 w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                <button
                  onClick={onClose}
                  className="flex-1 glass-subtle rounded-2xl py-3 font-heading font-semibold text-sm text-foreground hover:bg-white/60 transition"
                >
                  Later
                </button>
                <button
                  onClick={onShare}
                  className="flex-1 rounded-2xl py-3 font-heading font-semibold text-sm text-white flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg,#c4b5fd,#a78bfa)',
                    boxShadow: '0 8px 24px rgba(167,139,250,0.4)',
                  }}
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}