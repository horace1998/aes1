import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { base44 } from '@/api/base44Client';
import { X, Upload, ImageIcon, Sparkles } from 'lucide-react';

const ASSET_TYPES = ['badge', 'fanart', 'photo', 'sticker'];

export default function MilestoneUploadModal({ isOpen, onClose, onSaved, goal }) {
  const [assetUrl, setAssetUrl] = useState(null);
  const [assetType, setAssetType] = useState('badge');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setAssetUrl(file_url);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Milestone.create({
      goal_id: goal?.id || '',
      goal_title: goal?.title || '',
      idol_name: goal?.idol_name || '',
      idol_group: goal?.idol_group || '',
      asset_url: assetUrl,
      asset_type: assetType,
      caption: caption.trim(),
      timeline_value: goal?.timeline_value,
      timeline_unit: goal?.timeline_unit,
      checkins_completed: goal?.daily_checkins?.filter(c => c.completed).length || 0,
    });
    setSaving(false);
    onSaved?.();
    onClose();
    setAssetUrl(null);
    setCaption('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/25 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-lg mx-4 mb-4"
            initial={{ y: 400, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 400, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <GlassCard variant="strong" className="p-6 rounded-3xl" animate={false}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-heading text-xl font-bold">Add Milestone</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {goal ? `For: ${goal.title}` : 'Celebrate your achievement'}
                  </p>
                </div>
                <button onClick={onClose} className="glass-subtle rounded-full p-2">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Upload area */}
              <div
                className="relative rounded-2xl overflow-hidden mb-4 cursor-pointer"
                onClick={() => fileRef.current?.click()}
              >
                {assetUrl ? (
                  <motion.img
                    src={assetUrl}
                    alt="Milestone asset"
                    className="w-full h-48 object-cover"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring' }}
                  />
                ) : (
                  <div className="glass h-48 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/40 hover:border-purple-400/50 transition-colors">
                    {uploading ? (
                      <div className="w-8 h-8 border-3 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full glass-strong flex items-center justify-center">
                          <Upload className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                          Tap to upload your<br />fandom asset
                        </p>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Asset type */}
              <div className="flex gap-2 mb-4">
                {ASSET_TYPES.map(type => (
                  <button
                    key={type}
                    className={`flex-1 rounded-xl py-2 text-[10px] font-heading font-semibold uppercase tracking-wider transition-all ${
                      assetType === type
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                        : 'glass-subtle text-muted-foreground'
                    }`}
                    onClick={() => setAssetType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Caption */}
              <div className="glass-subtle rounded-xl p-3 mb-5">
                <label className="text-[10px] tracking-widest uppercase text-muted-foreground font-heading block mb-1">
                  Caption
                </label>
                <input
                  type="text"
                  placeholder="e.g. Finally did it! 30 days strong 💜"
                  className="w-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/40"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <GlassButton variant="ghost" onClick={onClose} className="flex-1">Cancel</GlassButton>
                <GlassButton
                  variant="primary"
                  onClick={handleSave}
                  disabled={!assetUrl || saving}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Milestone'}
                </GlassButton>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}