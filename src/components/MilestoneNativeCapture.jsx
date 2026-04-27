import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import ModalPortal from '@/components/ui/ModalPortal';
import { base44 } from '@/api/base44Client';

/**
 * MilestoneNativeCapture — Lets the user pick a goal, then opens the
 * device's native camera app (via <input capture>) so all hardware
 * controls (flash, zoom, etc.) are available. Uploads the photo and
 * returns it through onClose(fileUrl, goal).
 */
export default function MilestoneNativeCapture({ isOpen, onClose, goals = [] }) {
  const fileInputRef = useRef(null);
  const activeGoals = goals.filter(g => g.status === 'active');
  const [selectedGoal, setSelectedGoal] = useState(activeGoals[0] || null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) setSelectedGoal(activeGoals[0] || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, goals.length]);

  const openCamera = () => {
    if (!selectedGoal) return;
    fileInputRef.current?.click();
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !selectedGoal) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploading(false);
    onClose(file_url, selectedGoal);
  };

  return (
    <ModalPortal>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          style={{
            background: 'rgba(20,16,40,0.55)',
            backdropFilter: 'blur(8px)',
            paddingBottom: 'calc(7rem + env(safe-area-inset-bottom))',
            paddingTop: 'calc(1rem + env(safe-area-inset-top))',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !uploading && onClose(null)}
        >
          <motion.div
            className="w-full max-w-md max-h-full"
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <GlassCard variant="strong" className="p-5 max-h-full overflow-y-auto no-scrollbar" animate={false}>
              <div className="flex items-center justify-between mb-4">
                <p className="font-heading font-bold text-base">Capture Milestone</p>
                <button
                  onClick={() => !uploading && onClose(null)}
                  className="glass-subtle rounded-full p-1.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {activeGoals.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-2">No active goals yet.</p>
                  <p className="text-xs text-muted-foreground">Create a goal first to log milestones.</p>
                </div>
              ) : (
                <>
                  <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-heading mb-2">
                    For Goal
                  </p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {activeGoals.map(g => (
                      <button
                        key={g.id}
                        onClick={() => setSelectedGoal(g)}
                        className={`rounded-full px-3 py-1.5 text-xs font-heading font-semibold border transition-all ${
                          selectedGoal?.id === g.id
                            ? 'bg-violet-400 text-white border-violet-300'
                            : 'glass-subtle border-white/40 text-foreground'
                        }`}
                      >
                        {g.title}
                      </button>
                    ))}
                  </div>

                  <GlassButton
                    variant="primary"
                    onClick={openCamera}
                    disabled={!selectedGoal || uploading}
                    className="w-full"
                  >
                    <Camera className="w-4 h-4 mr-2 inline" />
                    {uploading ? 'Uploading…' : 'Open Camera'}
                  </GlassButton>

                  <p className="text-[10px] text-muted-foreground text-center mt-3">
                    Opens your device camera — flash, zoom and all controls available.
                  </p>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFile}
                className="hidden"
              />
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </ModalPortal>
  );
}