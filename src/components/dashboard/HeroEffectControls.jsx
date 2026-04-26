import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders, X } from 'lucide-react';

/**
 * HeroEffectControls — floating panel with 0-100 sliders for outline blur & glow.
 */
export default function HeroEffectControls({ open, onToggle, blur, glow, onBlurChange, onGlowChange }) {
  return (
    <>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute top-4 right-16 z-30 w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/25 transition"
        style={{ top: 36 }}
      >
        {open ? <X className="w-4 h-4 text-white" /> : <Sliders className="w-4 h-4 text-white" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-4 right-4 bottom-24 z-30 rounded-2xl p-4 space-y-3"
            style={{
              background: 'rgba(20, 14, 40, 0.75)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <SliderRow label="Glow" value={glow} onChange={onGlowChange} />
            <SliderRow label="Outline Blur" value={blur} onChange={onBlurChange} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SliderRow({ label, value, onChange }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="font-heading text-[10px] tracking-[0.2em] uppercase text-white/70">{label}</span>
        <span className="font-heading text-[10px] text-white/90 tabular-nums">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-violet-300 cursor-pointer"
      />
    </div>
  );
}