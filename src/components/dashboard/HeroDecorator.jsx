import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';

export default function HeroDecorator({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    mainBg: user?.hero_bg_url || null,
    centerIcon: user?.hero_center_url || null,
    supportingPhotos: user?.hero_support_urls || [],
  });
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setIsEditing(false);
    },
  });

  const handleFileUpload = async (file, type) => {
    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFiles(prev => ({
        ...prev,
        [type]: type === 'supportingPhotos' ? [...(prev[type] || []), file_url] : file_url,
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDecorations = async () => {
    await updateUserMutation.mutateAsync({
      hero_bg_url: uploadedFiles.mainBg,
      hero_center_url: uploadedFiles.centerIcon,
      hero_support_urls: uploadedFiles.supportingPhotos,
    });
  };

  const handleRemoveSupporting = (index) => {
    setUploadedFiles(prev => ({
      ...prev,
      supportingPhotos: prev.supportingPhotos.filter((_, i) => i !== index),
    }));
  };

  // Display mode
  if (!isEditing && (uploadedFiles.mainBg || uploadedFiles.centerIcon)) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-80 rounded-2xl overflow-hidden mb-6 group cursor-pointer"
        onClick={() => setIsEditing(true)}
      >
        {/* B&W background with overlay */}
        {uploadedFiles.mainBg && (
          <img
            src={uploadedFiles.mainBg}
            alt="hero"
            className="absolute inset-0 w-full h-full object-cover grayscale opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-black/30" />

        {/* Center color icon */}
        {uploadedFiles.centerIcon && (
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={uploadedFiles.centerIcon}
              alt="icon"
              className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>
        )}

        {/* Supporting photos bottom row */}
        {uploadedFiles.supportingPhotos.length > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {uploadedFiles.supportingPhotos.slice(0, 3).map((photo, i) => (
              <img
                key={i}
                src={photo}
                alt={`support-${i}`}
                className="w-20 h-20 rounded-lg object-cover border border-white/30 grayscale"
              />
            ))}
          </div>
        )}

        {/* Hover edit indicator */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white text-sm font-heading">Edit Decorations</p>
        </div>
      </motion.div>
    );
  }

  // Edit mode
  return (
    <GlassCard variant="strong" className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-bold">Decorate Your Page</h3>
        <button
          onClick={() => {
            setIsEditing(false);
            setUploadedFiles({
              mainBg: user?.hero_bg_url || null,
              centerIcon: user?.hero_center_url || null,
              supportingPhotos: user?.hero_support_urls || [],
            });
          }}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Main BG upload */}
        <div>
          <label className="block text-xs font-semibold mb-2 text-foreground/70">
            Background (B&W filtered)
          </label>
          <div className="relative">
            {uploadedFiles.mainBg && (
              <img src={uploadedFiles.mainBg} alt="main" className="w-full h-32 object-cover rounded-lg mb-2 grayscale" />
            )}
            <label className="flex items-center justify-center w-full h-28 border-2 border-dashed border-foreground/20 rounded-lg hover:border-foreground/40 transition-colors cursor-pointer bg-foreground/2">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'mainBg')}
              />
              <div className="text-center">
                <Upload className="w-5 h-5 mx-auto text-foreground/50 mb-1" />
                <p className="text-xs text-foreground/50">Choose image</p>
              </div>
            </label>
          </div>
        </div>

        {/* Center icon upload */}
        <div>
          <label className="block text-xs font-semibold mb-2 text-foreground/70">
            Center Icon (Full Color)
          </label>
          <div className="relative">
            {uploadedFiles.centerIcon && (
              <img src={uploadedFiles.centerIcon} alt="center" className="w-24 h-24 object-cover rounded-full mx-auto mb-2 border border-foreground/20" />
            )}
            <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-foreground/20 rounded-lg hover:border-foreground/40 transition-colors cursor-pointer bg-foreground/2">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'centerIcon')}
              />
              <div className="text-center">
                <Upload className="w-5 h-5 mx-auto text-foreground/50 mb-1" />
                <p className="text-xs text-foreground/50">Choose image</p>
              </div>
            </label>
          </div>
        </div>

        {/* Supporting photos */}
        <div>
          <label className="block text-xs font-semibold mb-2 text-foreground/70">
            Supporting Photos (up to 3)
          </label>
          <div className="flex gap-2 mb-2 flex-wrap">
            <AnimatePresence>
              {uploadedFiles.supportingPhotos.map((photo, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative"
                >
                  <img src={photo} alt={`support-${i}`} className="w-20 h-20 rounded-lg object-cover border border-foreground/20" />
                  <button
                    onClick={() => handleRemoveSupporting(i)}
                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5 hover:bg-destructive/90 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {uploadedFiles.supportingPhotos.length < 3 && (
              <label className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-foreground/20 rounded-lg hover:border-foreground/40 transition-colors cursor-pointer bg-foreground/2">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'supportingPhotos')}
                />
                <Upload className="w-4 h-4 text-foreground/50" />
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <GlassButton
          variant="ghost"
          className="flex-1 text-foreground"
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </GlassButton>
        <GlassButton
          variant="primary"
          className="flex-1"
          onClick={handleSaveDecorations}
          disabled={isUploading || updateUserMutation.isPending}
        >
          {isUploading || updateUserMutation.isPending ? 'Saving...' : 'Save'}
        </GlassButton>
      </div>
    </GlassCard>
  );
}