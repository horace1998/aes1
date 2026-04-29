import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getFanRank, getNextRank, getRankScore } from '@/lib/fanRank';

/**
 * Removes the background from an image URL using @imgly/background-removal
 * and returns a new object URL with a transparent PNG.
 */
async function removeBackground(imageUrl) {
  const { removeBackground: removeBg } = await import('@imgly/background-removal');
  const blob = await removeBg(imageUrl, {
    publicPath: 'https://unpkg.com/@imgly/background-removal@1.7.0/dist/',
    model: 'small',
    output: { format: 'image/png', quality: 0.9 },
  });
  return URL.createObjectURL(blob);
}

export default function FanRankBadge({ totalCheckins = 0, milestoneCount = 0, idolImageUrl }) {
  const rank = getFanRank(totalCheckins, milestoneCount);
  const score = getRankScore(totalCheckins, milestoneCount);
  const next = getNextRank(totalCheckins, milestoneCount);
  const [cutoutUrl, setCutoutUrl] = useState(null);
  const [processing, setProcessing] = useState(false);
  const prevUrl = useRef(null);

  const progress = next
    ? Math.min(100, Math.round(((score - (rank.minScore || 0)) / (next.rank.minScore - (rank.minScore || 0))) * 100))
    : 100;

  useEffect(() => {
    if (!idolImageUrl || idolImageUrl === prevUrl.current) return;
    prevUrl.current = idolImageUrl;
    setCutoutUrl(null);
    setProcessing(true);
    removeBackground(idolImageUrl)
      .then((url) => { setCutoutUrl(url); setProcessing(false); })
      .catch(() => { setCutoutUrl(idolImageUrl); setProcessing(false); });
  }, [idolImageUrl]);

  const showIdol = !!idolImageUrl;
  const IDOL_H = 210; // px, how tall the idol floats above the card
  const IDOL_OVERLAP = 80; // px that stick up above the card top

  return (
    <motion.div
      className="mb-7 relative"
      style={{ paddingTop: showIdol ? IDOL_H - IDOL_OVERLAP : 0 }}
    >
      {/* ── Hologram idol cutout (no box) ── */}
      {showIdol && (
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ top: 0, zIndex: 30, width: 160, height: IDOL_H }}
          aria-hidden="true"
        >
          {processing && (
            <div className="absolute inset-0 flex items-end justify-center pb-4">
              <div className="w-6 h-6 rounded-full border-2 border-blue-400/60 border-t-transparent animate-spin" />
            </div>
          )}

          {cutoutUrl && (
            <>
              {/* Holographic glow layers */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at 50% 90%, rgba(77,127,255,0.55) 0%, rgba(26,58,173,0.2) 50%, transparent 75%)',
                filter: 'blur(18px)',
                zIndex: 1,
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at 50% 60%, rgba(140,100,255,0.2) 0%, transparent 70%)',
                filter: 'blur(10px)',
                zIndex: 1,
              }} />

              {/* Iridescent shimmer overlay on the image */}
              <motion.div
                style={{
                  position: 'absolute', inset: 0, zIndex: 3,
                  background: 'linear-gradient(135deg, rgba(77,127,255,0.18) 0%, rgba(200,100,255,0.12) 40%, rgba(77,200,255,0.15) 80%, transparent 100%)',
                  mixBlendMode: 'screen',
                }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* The cutout image */}
              <motion.img
                src={cutoutUrl}
                alt=""
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'bottom center',
                  zIndex: 2,
                  filter: `
                    drop-shadow(0 -6px 18px rgba(77,127,255,0.8))
                    drop-shadow(0 0 40px rgba(26,58,173,0.6))
                    drop-shadow(0 8px 16px rgba(0,0,0,0.55))
                  `,
                }}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />

              {/* Bottom fade so idol blends into card */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: 56,
                background: 'linear-gradient(to top, #0d1f6b 0%, transparent 100%)',
                zIndex: 4,
              }} />
            </>
          )}
        </div>
      )}

      {/* ── Dark navy card ── */}
      <motion.div
        className="relative overflow-hidden"
        style={{
          borderRadius: 24,
          background: 'linear-gradient(135deg, #0a1540 0%, #0d1f6b 45%, #1a3aad 100%)',
          border: '1px solid rgba(77, 127, 255, 0.4)',
          boxShadow: '0 8px 48px rgba(26, 58, 173, 0.55), inset 0 1px 0 rgba(255,255,255,0.07)',
          padding: showIdol ? `${IDOL_H - IDOL_OVERLAP + 16}px 22px 18px` : '20px 22px 18px',
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        {/* Animated iridescent sheen on card */}
        <motion.div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(135deg, rgba(77,127,255,0.06) 0%, rgba(140,80,255,0.04) 50%, transparent 100%)',
          }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Ghost rank watermark */}
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none select-none"
          aria-hidden="true"
          style={{
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: 90, lineHeight: 1,
            color: 'rgba(255,255,255,0.04)',
            letterSpacing: '0.04em',
          }}
        >
          {rank.label}
        </div>

        {/* Header row */}
        <div className="flex items-start justify-between mb-1 relative">
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
        <div className="flex items-baseline gap-3 mb-4 relative">
          <h3 style={{
            fontFamily: 'Bebas Neue, Impact, sans-serif',
            fontSize: 'clamp(2.2rem, 10vw, 3.5rem)',
            color: '#fff', lineHeight: 1, letterSpacing: '0.06em',
          }}>
            {rank.label}
          </h3>
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic', fontSize: 13,
            color: 'rgba(255,255,255,0.5)',
          }}>
            {rank.description}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
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
          textAlign: 'right', marginTop: 7,
        }}>
          {next ? `${next.pointsNeeded} pts to ${next.rank.label}` : '— apex tier —'}
        </p>
      </motion.div>
    </motion.div>
  );
}