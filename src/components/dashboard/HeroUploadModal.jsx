import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { X, Upload, Sparkles, Crop, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CropTool from './CropTool';

/**
 * HeroUploadModal — pick image, choose AI auto-cutout or manual crop,
 * returns final image URL (uploaded) via onSave.
 */
export default function HeroUploadModal({ isOpen, onClose, onSave, role = 'hero' }) {
  const [step, setStep] = useState('pick'); // pick | choose | crop | processing
  const [sourceUrl, setSourceUrl] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const reset = () => {
    setStep('pick');
    setSourceUrl(null);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setStep('processing');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setSourceUrl(file_url);
      setStep('choose');
    } catch (err) {
      setError('Upload failed');
      setStep('pick');
    }
  };

  const handleAutoCutout = async () => {
    setStep('processing');
    setError(null);
    try {
      const res = await base44.functions.invoke('removeBackground', { image_url: sourceUrl });
      const cutoutUrl = res.data?.url;
      if (!cutoutUrl) throw new Error('No image returned');
      onSave(cutoutUrl);
      reset();
    } catch (err) {
      setError('AI cutout failed. Try Quick Crop.');
      setStep('choose');
    }
  };

  const handleCropComplete = async (croppedBlob) => {
    setStep('processing');
    try {
      const file = new File([croppedBlob], 'cropped.png', { type: 'image/png' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onSave(file_url);
      reset();
    } catch (err) {
      setError('Upload failed');
      setStep('crop');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
          <motion.div
            className="relative w-full max-w-lg mx-4 mb-4"
            initial={{ y: 300, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <GlassCard variant="strong" className="p-6 rounded-3xl" animate={false}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-2xl tracking-wide uppercase">
                  {role === 'hero' ? 'Hero Image' : 'Add to Filmstrip'}
                </h3>
                <button onClick={handleClose} className="glass-subtle rounded-full p-2">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {step === 'pick' && (
                <div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full glass-subtle rounded-2xl p-10 flex flex-col items-center gap-3 hover:ring-1 hover:ring-violet-300/60 transition-all"
                  >
                    <Upload className="w-8 h-8 text-violet-400" />
                    <p className="font-heading font-semibold text-sm">Upload Photo</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG up to 10MB</p>
                  </button>
                  <input
                    ref={fileRef} type="file" accept="image/*"
                    className="hidden" onChange={handleFile}
                  />
                  {error && <p className="text-xs text-red-500 mt-3 text-center">{error}</p>}
                </div>
              )}

              {step === 'choose' && sourceUrl && (
                <div className="space-y-3">
                  <img src={sourceUrl} alt="" className="w-full h-48 object-cover rounded-2xl" />
                  <p className="text-xs text-muted-foreground text-center">
                    How would you like to process it?
                  </p>
                  <button
                    onClick={handleAutoCutout}
                    className="w-full glass-subtle rounded-2xl p-4 flex items-center gap-3 hover:ring-1 hover:ring-violet-300/60 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-400 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-heading font-semibold text-sm">Auto Cutout (AI)</p>
                      <p className="text-[11px] text-muted-foreground">Removes background automatically</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setStep('crop')}
                    className="w-full glass-subtle rounded-2xl p-4 flex items-center gap-3 hover:ring-1 hover:ring-violet-300/60 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-300 to-violet-300 flex items-center justify-center">
                      <Crop className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-heading font-semibold text-sm">Quick Crop</p>
                      <p className="text-[11px] text-muted-foreground">Manually select the area</p>
                    </div>
                  </button>
                  {error && <p className="text-xs text-red-500 text-center">{error}</p>}
                </div>
              )}

              {step === 'crop' && sourceUrl && (
                <CropTool
                  imageUrl={sourceUrl}
                  onCancel={() => setStep('choose')}
                  onComplete={handleCropComplete}
                />
              )}

              {step === 'processing' && (
                <div className="flex flex-col items-center gap-3 py-12">
                  <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                  <p className="font-heading text-sm">Processing...</p>
                  <p className="text-[11px] text-muted-foreground">This may take a few seconds</p>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}