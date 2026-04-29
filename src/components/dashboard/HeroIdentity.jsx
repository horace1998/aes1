import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ImagePlus, User as UserIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * HeroIdentity — compact circular avatar showing the user's hero image.
 * Replaces the large hero banner with a small "user identity icon".
 * Clicking it routes to /profile, preserving the editing flow.
 */
export default function HeroIdentity({ user, size = 44 }) {
  const { data: assets = [] } = useQuery({
    queryKey: ['heroAssets'],
    queryFn: () => base44.entities.HeroAsset.list('order'),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const hero = assets.find(a => a.role === 'hero');
  const [imgReady, setImgReady] = useState(false);

  useEffect(() => {
    if (!hero?.image_url) { setImgReady(false); return; }
    setImgReady(false);
    const img = new Image();
    img.decoding = 'async';
    img.src = hero.image_url;
    let cancelled = false;
    const done = () => { if (!cancelled) setImgReady(true); };
    if (img.decode) img.decode().then(done).catch(done);
    else { img.onload = done; img.onerror = done; }
    return () => { cancelled = true; };
  }, [hero?.image_url]);

  return (
    <Link to="/profile" className="block">
      <motion.div
        className="relative rounded-full overflow-hidden"
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg,#c4b5fd,#bae6fd,#fbcfe8)',
          padding: 2,
          boxShadow: '0 6px 18px rgba(167,139,250,0.30), inset 0 1px 0 rgba(255,255,255,0.8)',
        }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div
          className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center relative"
          style={{ background: 'rgba(255,255,255,0.9)' }}
        >
          {hero?.image_url ? (
            <>
              <motion.img
                src={hero.image_url}
                alt="hero"
                className="w-full h-full object-cover"
                initial={false}
                animate={{ opacity: imgReady ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  filter: `brightness(${(hero.brightness || 100) / 100}) contrast(${(hero.contrast || 100) / 100}) saturate(${(hero.saturation || 100) / 100})`,
                }}
              />
              {!imgReady && (
                <div
                  className="absolute inset-0 animate-pulse"
                  style={{ background: 'radial-gradient(circle, rgba(196,181,253,0.4), transparent 70%)' }}
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full" title="Add hero image">
              <ImagePlus className="w-4 h-4 text-violet-400" />
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}