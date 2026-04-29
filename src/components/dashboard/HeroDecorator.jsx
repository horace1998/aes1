import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';

export default function HeroDecorator({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [bgUrl, setBgUrl] = useState(user?.hero_bg_url || null);
  const [sideImages, setSideImages] = useState(user?.hero_side_urls || [null, null]);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setIsEditing(false);
    },
  });

  const handleFileUpload = async (file, type, index = null) => {
    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (type === 'bg') {
        setBgUrl(file_url);
      } else {
        setSideImages(prev => {
          const newArr = [...prev];
          newArr[index] = file_url;
          return newArr;
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDecorations = async () => {
    await updateUserMutation.mutateAsync({
      hero_bg_url: bgUrl,
      hero_side_urls: sideImages,
    });
  };

  const centerImage = user?.background_image_url;

  // Display mode
  if (!isEditing && bgUrl) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-80 rounded-2xl overflow-hidden mb-6 group cursor-pointer"
        onClick={() => setIsEditing(true)}
      >
        {/* B&W background with black filter */}
        <img
          src={bgUrl}
          alt="hero"
          className="absolute inset-0 w-full h-full object-cover grayscale brightness-50"
        />

        {/* Center color idol image */}
        {centerImage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={centerImage}
              alt="idol"
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

        {/* Hover edit indicator */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white text-sm font-heading">Edit</p>
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
            setBgUrl(user?.hero_bg_url || null);
            setSideImages(user?.hero_side_urls || [null, null]);
          }}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Main BG upload */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-foreground/70">
              Background (Black Filter Applied)
            </label>
            {bgUrl && (
              <button
                onClick={() => setBgUrl(null)}
                className="text-xs text-destructive hover:text-destructive/80 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          {bgUrl && (
            <img src={bgUrl} alt="bg" className="w-full h-32 object-cover rounded-lg mb-2 grayscale brightness-50" />
          )}
          <label className="flex items-center justify-center w-full h-28 border-2 border-dashed border-foreground/20 rounded-lg hover:border-foreground/40 transition-colors cursor-pointer bg-foreground/2">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'bg')}
            />
            <div className="text-center">
              <Upload className="w-5 h-5 mx-auto text-foreground/50 mb-1" />
              <p className="text-xs text-foreground/50">Upload background</p>
            </div>
          </label>
        </div>

        {/* Side images */}
        <div>
          <label className="block text-xs font-semibold mb-2 text-foreground/70">
            Side Images (Left & Right, shows half)
          </label>
          <div className="flex gap-4">
            {[0, 1].map((idx) => (
              <div key={idx} className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-foreground/50">{idx === 0 ? 'Left' : 'Right'}</p>
                  {sideImages[idx] && (
                    <button
                      onClick={() => setSideImages(prev => {
                        const newArr = [...prev];
                        newArr[idx] = null;
                        return newArr;
                      })}
                      className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {sideImages[idx] && (
                  <img src={sideImages[idx]} alt={`side-${idx}`} className="w-full h-24 object-cover rounded-lg mb-2 border border-foreground/20" />
                )}
                <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-foreground/20 rounded-lg hover:border-foreground/40 transition-colors cursor-pointer bg-foreground/2">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'side', idx)}
                  />
                  <Upload className="w-4 h-4 text-foreground/50" />
                </label>
              </div>
            ))}
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