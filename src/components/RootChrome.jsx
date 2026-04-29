import React from 'react';
import { createPortal } from 'react-dom';
import BottomNav from '@/components/BottomNav';
import { useNavAction } from '@/lib/NavActionContext';
import { useCheckinReminder } from '@/lib/useCheckinReminder';

/**
 * RootChrome — persistent UI layer (top bar + bottom nav) mounted ONCE
 * at the app root, outside page transitions so it never flickers.
 */
export default function RootChrome() {
  const { select } = useNavAction();
  useCheckinReminder();

  const topBar = (
    <div
      className="fixed top-0 left-0 right-0 z-[55] flex items-center justify-center"
      style={{
        height: 44,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <p className="font-display text-sm tracking-[0.45em]" style={{ fontWeight: 700, color: '#111827' }}>
        SYNKIFY
      </p>
    </div>
  );

  return (
    <>
      {typeof document !== 'undefined' && createPortal(topBar, document.body)}
      <BottomNav onSelect={select} />
    </>
  );
}