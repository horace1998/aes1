import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, ImagePlus, Trash2 } from 'lucide-react';
import HeroUploadModal from './HeroUploadModal';

/**
 * HeroBanner — editorial-style hero with bold display headline,
 * subject cutout with glow, and a filmstrip of idol photos below.
 */
export default function HeroBanner({ user }) {
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [uploadRole, setUploadRole] = useState('hero');

  const { data: assets = [] } = useQuery({
    queryKey: ['heroAssets'],
    queryFn: () => base44.entities.HeroAsset.list('order'),
  });

  const hero = assets.find(a => a.role === 'hero');
  const filmstrip = assets.filter(a => a.role === 'filmstrip');

  const saveMutation = useMutation({
    mutationFn: async ({ url, role }) => {
      // For hero: replace existing
      if (role === 'hero' && hero) {
        return base44.entities.HeroAsset.update(hero.id, { image_url: url });
      }
      return base44.entities.HeroAsset.create({
        image_url: url,
        role,
        order: role === 'filmstrip' ? filmstrip.length : 0,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['heroAssets'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.HeroAsset.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['heroAssets'] }),
  });

  const openUpload = (role) => {
    setUploadRole(role);
    setShowUpload(true);
  };

  const idolName = (user?.favorite_idol || 'YOUR IDOL').toUpperCase();
  const groupName = (user?.favorite_group || 'SYNKIFY').toUpperCase();

  return (
    <div className="mb-8">
      {/* Main hero */}
      <motion.div
        className="relative rounded-3xl overflow-hidden aspect-[4/5] mb-3"
        style={{
          background: 'linear-gradient(160deg, #1a1530 0%, #0f0a20 50%, #1a1024 100%)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      >
        {/* Top labels */}
        <div className="absolute top-4 left-5 right-5 flex justify-between z-20">
          <span className="font-heading text-[10px] tracking-[0.2em] text-white/80 uppercase">
            Daily Drive
          </span>
          <span className="font-heading text-[10px] tracking-[0.2em] text-white/80 uppercase">
            By {user?.full_name?.split(' ')[0] || 'You'}
          </span>
        </div>

        {/* Big editorial title */}
        <div className="absolute inset-x-0 top-12 z-10 px-5 pointer-events-none">
          <h1 className="font-display text-white leading-[0.85] tracking-tight text-[clamp(56px,16vw,120px)]">
            {idolName.split(' ')[0]?.slice(0, 6) || 'ALL'}
          </h1>
          <h1 className="font-display text-white leading-[0.85] tracking-tight text-[clamp(56px,16vw,120px)]">
            {(idolName.split(' ')[1] || groupName).slice(0, 7)}
          </h1>
        </div>

        {/* Ghost/echo word behind */}
        <div className="absolute inset-x-0 bottom-16 z-[5] px-5 pointer-events-none overflow-hidden">
          <h2
            className="font-display leading-[0.85] tracking-tight text-[clamp(70px,20vw,140px)]"
            style={{
              color: 'transparent',
              WebkitTextStroke: '1px rgba(255,255,255,0.18)',
            }}
          >
            {groupName.slice(0, 6)}
          </h2>
        </div>

        {/* Hero subject image with glow */}
        {hero ? (
          <>
            <div
              className="absolute inset-0 z-[8] pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 50% 55%, rgba(196,181,253,0.35) 0%, rgba(186,230,253,0.18) 30%, transparent 60%)',
                filter: 'blur(20px)',
              }}
            />
            <img
              src={hero.image_url}
              alt="hero"
              className="absolute inset-0 w-full h-full object-contain object-bottom z-[15]"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(196,181,253,0.5)) drop-shadow(0 10px 40px rgba(0,0,0,0.6))',
              }}
            />
            <button
              onClick={() => openUpload('hero')}
              className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/25 transition"
              style={{ top: 36 }}
            >
              <ImagePlus className="w-4 h-4 text-white" />
            </button>
          </>
        ) : (
          <button
            onClick={() => openUpload('hero')}
            className="absolute inset-x-8 bottom-8 z-20 glass-subtle rounded-2xl py-4 px-5 flex items-center justify-center gap-2 text-white border border-white/20 hover:bg-white/10 transition"
          >
            <ImagePlus className="w-5 h-5" />
            <span className="font-heading text-sm font-semibold">Add Hero Image</span>
          </button>
        )}

        {/* Bottom gradient fade into filmstrip */}
        <div className="absolute bottom-0 left-0 right-0 h-20 z-[18] pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(15,10,32,0.95))' }}
        />
      </motion.div>

      {/* Filmstrip */}
      <div
        className="rounded-2xl p-2"
        style={{ background: 'linear-gradient(135deg,#2a2440,#1a1530)' }}
      >
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {filmstrip.map((asset) => (
            <FilmstripTile
              key={asset.id}
              asset={asset}
              onDelete={() => deleteMutation.mutate(asset.id)}
            />
          ))}
          <button
            onClick={() => openUpload('filmstrip')}
            className="flex-shrink-0 w-20 h-24 rounded-xl border-2 border-dashed border-white/30 flex items-center justify-center hover:border-white/60 transition"
          >
            <Plus className="w-5 h-5 text-white/70" />
          </button>
        </div>
      </div>

      <HeroUploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        role={uploadRole}
        onSave={(url) => {
          saveMutation.mutate({ url, role: uploadRole });
          setShowUpload(false);
        }}
      />
    </div>
  );
}

function FilmstripTile({ asset, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);
  return (
    <div
      className="relative flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden group"
      onClick={() => setShowDelete(v => !v)}
    >
      <img
        src={asset.image_url}
        alt=""
        className="w-full h-full object-cover"
        style={{ filter: 'grayscale(0.4) contrast(1.05)' }}
      />
      {showDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute inset-0 bg-black/60 flex items-center justify-center"
        >
          <Trash2 className="w-4 h-4 text-white" />
        </button>
      )}
    </div>
  );
}