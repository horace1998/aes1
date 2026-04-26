import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, Check, RotateCcw, ImagePlus } from 'lucide-react';
import GlassButton from '@/components/ui/GlassButton';
import HeroPreview from './HeroPreview';
import HeroUploadModal from '@/components/dashboard/HeroUploadModal';

const DEFAULTS = {
  glow: 50,
  blur: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  shadow: 50,
  text_color: '#ffffff',
};

const PRESET_COLORS = ['#ffffff', '#f5d0fe', '#fcd34d', '#fda4af', '#a5b4fc', '#86efac', '#000000'];

/**
 * HeroEditor — full-screen editor for the hero image.
 * Live preview at the top, controls below. Apply / Cancel commits to DB.
 */
export default function HeroEditor({ isOpen, onClose, hero, user }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(DEFAULTS);
  const [draftImage, setDraftImage] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  // Initialize draft from hero whenever it opens
  useEffect(() => {
    if (isOpen) {
      setDraft({
        glow: hero?.glow ?? DEFAULTS.glow,
        blur: hero?.blur ?? DEFAULTS.blur,
        brightness: hero?.brightness ?? DEFAULTS.brightness,
        contrast: hero?.contrast ?? DEFAULTS.contrast,
        saturation: hero?.saturation ?? DEFAULTS.saturation,
        shadow: hero?.shadow ?? DEFAULTS.shadow,
        text_color: hero?.text_color ?? DEFAULTS.text_color,
      });
      setDraftImage(hero?.image_url || null);
    }
  }, [isOpen, hero?.id]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...draft, image_url: draftImage };
      if (hero) return base44.entities.HeroAsset.update(hero.id, payload);
      return base44.entities.HeroAsset.create({ ...payload, role: 'hero', order: 0 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroAssets'] });
      onClose();
    },
  });

  const update = (key, value) => setDraft(d => ({ ...d, [key]: value }));
  const reset = () => setDraft(DEFAULTS);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-background overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Header */}
          <div className="sticky top-0 z-30 glass-strong border-b border-white/40 px-5 py-3 flex items-center justify-between">
            <button onClick={onClose} className="glass-subtle rounded-full p-2">
              <X className="w-4 h-4" />
            </button>
            <p className="font-heading text-sm font-bold uppercase tracking-wider">Hero Editor</p>
            <button onClick={reset} className="glass-subtle rounded-full p-2" title="Reset">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 py-4 max-w-xl mx-auto">
            {/* Live preview */}
            <div className="mb-4">
              <HeroPreview
                imageUrl={draftImage}
                settings={draft}
                idolName={user?.favorite_idol}
                groupName={user?.favorite_group}
                compact
              />
            </div>

            {/* Replace image */}
            <button
              onClick={() => setShowUpload(true)}
              className="w-full glass-subtle rounded-2xl py-3 px-4 mb-5 flex items-center justify-center gap-2 hover:bg-white/60 transition"
            >
              <ImagePlus className="w-4 h-4 text-violet-500" />
              <span className="font-heading text-sm font-semibold">
                {draftImage ? 'Replace Image' : 'Upload Image'}
              </span>
            </button>

            {/* Text color */}
            <div className="mb-5">
              <p className="font-heading text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Text Color</p>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => update('text_color', c)}
                    className={`w-8 h-8 rounded-full border-2 transition ${draft.text_color === c ? 'border-violet-500 scale-110' : 'border-white/60'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <label className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white/60 cursor-pointer flex items-center justify-center"
                  style={{ background: 'conic-gradient(red, orange, yellow, green, cyan, blue, magenta, red)' }}
                >
                  <input
                    type="color"
                    value={draft.text_color}
                    onChange={(e) => update('text_color', e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4">
              <Slider label="Glow"       value={draft.glow}       min={0}   max={100} onChange={(v) => update('glow', v)} />
              <Slider label="Outline Blur" value={draft.blur}     min={0}   max={100} onChange={(v) => update('blur', v)} />
              <Slider label="Brightness" value={draft.brightness} min={50}  max={150} onChange={(v) => update('brightness', v)} />
              <Slider label="Contrast"   value={draft.contrast}   min={50}  max={150} onChange={(v) => update('contrast', v)} />
              <Slider label="Saturation" value={draft.saturation} min={0}   max={200} onChange={(v) => update('saturation', v)} />
              <Slider label="Shadow"     value={draft.shadow}     min={0}   max={100} onChange={(v) => update('shadow', v)} />
            </div>

            {/* Apply */}
            <div className="flex gap-3 mt-6 mb-8">
              <GlassButton variant="ghost" onClick={onClose} className="flex-1">Cancel</GlassButton>
              <GlassButton
                variant="primary"
                onClick={() => saveMutation.mutate()}
                disabled={!draftImage || saveMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {saveMutation.isPending ? 'Saving...' : 'Apply'}
              </GlassButton>
            </div>
          </div>

          <HeroUploadModal
            isOpen={showUpload}
            onClose={() => setShowUpload(false)}
            role="hero"
            onSave={(url) => {
              setDraftImage(url);
              setShowUpload(false);
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Slider({ label, value, min, max, onChange }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="font-heading text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{label}</span>
        <span className="font-heading text-[10px] text-foreground tabular-nums">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-violet-500 cursor-pointer"
      />
    </div>
  );
}