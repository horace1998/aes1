import React from 'react';

/**
 * HeroPreview — pure visual renderer of the hero banner.
 * Used by both the dashboard (live) and the profile editor (preview).
 *
 * settings: { glow, blur, brightness, contrast, saturation, shadow, text_color }
 */
export default function HeroPreview({ imageUrl, settings, idolName = 'YOUR IDOL', groupName = 'SYNKIFY', compact = false }) {
  const {
    glow = 50,
    blur = 0,
    brightness = 100,
    contrast = 100,
    saturation = 100,
    shadow = 50,
    text_color = '#ffffff',
  } = settings || {};

  const upperIdol = (idolName || 'YOUR IDOL').toUpperCase();
  const upperGroup = (groupName || 'SYNKIFY').toUpperCase();

  return (
    <div
      className={`relative rounded-3xl overflow-hidden ${compact ? 'aspect-[4/5]' : 'aspect-[4/5]'}`}
      style={{ background: 'linear-gradient(160deg, #1a1530 0%, #0f0a20 50%, #1a1024 100%)' }}
    >
      {/* Editorial title */}
      <div className="absolute inset-x-0 top-8 z-20 px-5 pointer-events-none">
        <h1
          className="font-display leading-[0.85] tracking-tight"
          style={{
            color: text_color,
            fontSize: compact ? 'clamp(40px,12vw,80px)' : 'clamp(56px,16vw,120px)',
          }}
        >
          {upperIdol.split(' ')[0]?.slice(0, 6) || 'ALL'}
        </h1>
        <h1
          className="font-display leading-[0.85] tracking-tight"
          style={{
            color: text_color,
            fontSize: compact ? 'clamp(40px,12vw,80px)' : 'clamp(56px,16vw,120px)',
          }}
        >
          {(upperIdol.split(' ')[1] || upperGroup).slice(0, 7)}
        </h1>
      </div>

      {/* Ghost echo */}
      <div className="absolute inset-x-0 bottom-16 z-[5] px-5 pointer-events-none overflow-hidden">
        <h2
          className="font-display leading-[0.85] tracking-tight"
          style={{
            color: 'transparent',
            WebkitTextStroke: `1px ${hexToRgba(text_color, 0.18)}`,
            fontSize: compact ? 'clamp(50px,15vw,90px)' : 'clamp(70px,20vw,140px)',
          }}
        >
          {upperGroup.slice(0, 6)}
        </h2>
      </div>

      {imageUrl && (
        <>
          {/* Glow halo */}
          <div
            className="absolute inset-0 z-[8] pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 55%, rgba(196,181,253,${0.6 * (glow / 100)}) 0%, rgba(186,230,253,${0.3 * (glow / 100)}) 30%, transparent 60%)`,
              filter: `blur(${20 + glow * 0.4}px)`,
            }}
          />
          <img
            src={imageUrl}
            alt="hero"
            className="absolute inset-0 w-full h-full object-contain object-bottom z-[10]"
            style={{
              filter: `
                brightness(${brightness}%)
                contrast(${contrast}%)
                saturate(${saturation}%)
                drop-shadow(0 0 ${blur * 0.6}px rgba(255,255,255,${blur / 200}))
                drop-shadow(0 0 ${10 + glow * 0.6}px rgba(196,181,253,${0.3 + glow / 200}))
                drop-shadow(0 0 ${glow * 0.4}px rgba(186,230,253,${glow / 250}))
                drop-shadow(0 ${10 + shadow * 0.2}px ${20 + shadow * 0.6}px rgba(0,0,0,${shadow / 120}))
              `,
            }}
          />
        </>
      )}

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 z-[18] pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(15,10,32,0.95))' }}
      />
    </div>
  );
}

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}