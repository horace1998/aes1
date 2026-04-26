import React from 'react';
import BottomNav from '@/components/BottomNav';
import { useNavAction } from '@/lib/NavActionContext';
import { useCheckinReminder } from '@/lib/useCheckinReminder';

/**
 * RootChrome — mounted ONCE at the app root, outside <AnimatePresence>
 * and <PageTransition>. Hosts the persistent BottomNav and starts the
 * daily check-in reminder scheduler.
 */
export default function RootChrome() {
  const { select } = useNavAction();
  useCheckinReminder();
  return <BottomNav onSelect={select} />;
}