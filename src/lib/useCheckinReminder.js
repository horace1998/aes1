import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

const STORAGE_KEY = 'synkify_reminder_settings_v1';
const LAST_NOTIFIED_KEY = 'synkify_last_notified_date';

export const DEFAULT_SETTINGS = {
  enabled: true,
  hour: 20,    // 8 PM local time
  minute: 0,
};

export function getReminderSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveReminderSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return await Notification.requestPermission();
}

function todayKey() {
  return format(new Date(), 'yyyy-MM-dd');
}

function hasCheckedInAllToday(goals) {
  const today = todayKey();
  const active = goals.filter((g) => g.status === 'active');
  if (active.length === 0) return true; // nothing to remind about
  return active.every((g) =>
    (g.daily_checkins || []).some((c) => c.date === today && c.completed)
  );
}

function fireReminder(missedCount) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const title = '✨ SYNKIFY — Daily check-in';
  const body =
    missedCount === 1
      ? "You haven't checked in today. Stay synced with your idol — just one tap!"
      : `${missedCount} goals are waiting for your check-in. Keep your streak alive!`;
  try {
    new Notification(title, {
      body,
      icon: '/icon-192.png',
      tag: 'synkify-daily-checkin',
      renotify: false,
    });
    localStorage.setItem(LAST_NOTIFIED_KEY, todayKey());
  } catch {
    // ignore
  }
}

/**
 * Hook that schedules a daily local notification reminder if the user
 * hasn't checked in to all active goals by the configured time.
 */
export function useCheckinReminder() {
  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list('-created_date'),
  });

  const goalsRef = useRef(goals);
  goalsRef.current = goals;

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    const check = () => {
      const settings = getReminderSettings();
      if (!settings.enabled) return;
      if (Notification.permission !== 'granted') return;

      const now = new Date();
      const reminderTime = new Date();
      reminderTime.setHours(settings.hour, settings.minute, 0, 0);

      if (now < reminderTime) return; // not time yet

      const lastNotified = localStorage.getItem(LAST_NOTIFIED_KEY);
      if (lastNotified === todayKey()) return; // already notified today

      const currentGoals = goalsRef.current || [];
      if (hasCheckedInAllToday(currentGoals)) return; // already checked in

      const today = todayKey();
      const missed = currentGoals.filter(
        (g) =>
          g.status === 'active' &&
          !(g.daily_checkins || []).some((c) => c.date === today && c.completed)
      ).length;

      if (missed > 0) fireReminder(missed);
    };

    // Check on mount, on visibility change, and every minute.
    check();
    const interval = setInterval(check, 60 * 1000);
    const onVisible = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
}