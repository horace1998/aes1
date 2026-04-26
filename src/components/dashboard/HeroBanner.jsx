import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ImagePlus } from 'lucide-react';
import HeroPreview from '@/components/profile/HeroPreview';
import { Link } from 'react-router-dom';

/**
 * HeroBanner — editorial-style hero. Pure display.
 * All editing now lives in the Profile page.
 */
export default function HeroBanner({ user }) {
  const { data: assets = [] } = useQuery({
    queryKey: ['heroAssets'],
    queryFn: () => base44.entities.HeroAsset.list('order'),
  });

  const hero = assets.find(a => a.role === 'hero');

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
    >
      {hero ? (
        <HeroPreview
          imageUrl={hero.image_url}
          settings={hero}
          idolName={user?.favorite_idol}
          groupName={user?.favorite_group}
        />
      ) : (
        <div
          className="relative rounded-3xl overflow-hidden aspect-[4/5] flex items-center justify-center"
          style={{ background: 'linear-gradient(160deg, #1a1530 0%, #0f0a20 50%, #1a1024 100%)' }}
        >
          <Link
            to="/profile"
            className="glass-subtle rounded-2xl py-4 px-5 flex items-center gap-2 text-white border border-white/20 hover:bg-white/10 transition"
          >
            <ImagePlus className="w-5 h-5" />
            <span className="font-heading text-sm font-semibold">Add Hero Image in Profile</span>
          </Link>
        </div>
      )}
    </motion.div>
  );
}