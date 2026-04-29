import React from 'react';
import { motion } from 'framer-motion';
import { getFanRank, getNextRank, getRankScore } from '@/lib/fanRank';

export default function HeroDecorator({ user, totalCheckins = 0, milestoneCount = 0 }) {
  const bgUrl = user?.hero_bg_url;
  const sideImages = user?.hero_side_urls || [null, null];
  
  const rank = getFanRank(totalCheckins, milestoneCount);
  const score = getRankScore(totalCheckins, milestoneCount);
  const next = getNextRank(totalCheckins, milestoneCount);
  const progress = next
    ? Math.min(100, Math.round(((score - (rank.minScore || 0)) / (next.rank.minScore - (rank.minScore || 0))) * 100))
    : 100;

  if (!bgUrl) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative rounded-2xl overflow-hidden mb-6"
      style={{
        minHeight: 380,
        background: 'linear-gradient(135deg, #0a1540 0%, #0d1f6b 45%, #1a3aad 100%)',
        border: '1px solid rgba(77, 127, 255, 0.4)',
        boxShadow: '0 8px 48px rgba(26, 58, 173, 0.55), inset 0 1px 0 rgba(255,255,255,0.07)',
      }}
    >
      {/* B&W background with black filter */}
      <img
        src={bgUrl}
        alt="hero"
        className="absolute inset-0 w-full h-full object-cover grayscale brightness-50"
      />

      {/* Center color image (same as background, no filter) */}
      {bgUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={bgUrl}
            alt="center"
            className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-xl"
          />
        </div>
      )}

      {/* Left side image (half visible) */}
      {sideImages[0] && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-48 overflow-hidden rounded-r-2xl shadow-lg">
          <img src={sideImages[0]} alt="left" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Right side image (half visible) */}
      {sideImages[1] && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-48 overflow-hidden rounded-l-2xl shadow-lg">
          <img src={sideImages[1]} alt="right" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Fan Rank info card — bottom */}
      <div className="absolute bottom-0 right-0 left-0 p-6 relative z-10" style={{
        background: 'linear-gradient(to top, rgba(10,21,64,0.95), rgba(13,31,107,0.9), transparent)',
      }}>
        {/* Header row */}
        <div className="flex items-start justify-between mb-1">
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 9, fontWeight: 700, letterSpacing: '0.38em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
          }}>
            Fan Rank
          </span>
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 9, fontWeight: 700, letterSpacing: '0.3em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
          }}>
            {String(score).padStart(3, '0')} PTS
          </span>
        </div>

        {/* Rank title */}
        <div className="flex items-baseline gap-3 mb-3">
          <h3 style={{
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: 'clamp(1.8rem, 8vw, 2.6rem)',
            color: '#fff', lineHeight: 1, letterSpacing: '0.06em',
          }}>
            {rank.label}
          </h3>
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic', fontSize: 12,
            color: 'rgba(255,255,255,0.5)',
          }}>
            {rank.description}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginBottom: 7 }}>
          <motion.div
            style={{
              height: '100%', borderRadius: 99,
              background: 'linear-gradient(90deg, rgba(77,127,255,0.9), rgba(200,160,255,0.85))',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />
        </div>
        <p style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 9, fontWeight: 600, letterSpacing: '0.3em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)',
          textAlign: 'right',
        }}>
          {next ? `${next.pointsNeeded} pts to ${next.rank.label}` : '— apex tier —'}
        </p>
      </div>
    </motion.div>
  );
}