import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * HomeSplash — 0.3s elegant intro shown each time the Home page mounts.
 * SYNKIFY wordmark with a hairline rule that draws across, then fades out.
 */
export default function HomeSplash() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          style={{ background: '#ffffff' }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div className="text-center">
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 9, fontWeight: 700, letterSpacing: '0.4em',
                textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)',
                marginBottom: 8,
              }}
            >
              Est. MMXXVI
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, letterSpacing: '0.2em' }}
              animate={{ opacity: 1, letterSpacing: '0.04em' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: 'Bebas Neue, Impact, sans-serif',
                fontSize: 48, color: '#0d1117', fontWeight: 700,
                lineHeight: 1,
              }}
            >
              SYNKIFY
            </motion.h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              style={{
                height: 1, background: '#1a3aad',
                marginTop: 10, transformOrigin: 'center',
                width: 120, marginLeft: 'auto', marginRight: 'auto',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}