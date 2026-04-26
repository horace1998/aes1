import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { format } from 'date-fns';

export default function NotificationBell({ userEmail }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userEmail],
    queryFn: () => base44.entities.Notification.filter({ user_email: userEmail }, '-created_date', 10),
    enabled: !!userEmail,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unread = notifications.filter(n => !n.is_read).length;

  const handleOpen = () => {
    setOpen(o => !o);
    // Mark all as read when opened
    notifications.filter(n => !n.is_read).forEach(n => markReadMutation.mutate(n.id));
  };

  return (
    <div className="relative">
      <motion.button
        className="glass-subtle rounded-full p-2.5 relative"
        whileTap={{ scale: 0.9 }}
        onClick={handleOpen}
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-[9px] font-bold text-white"
          >
            {unread}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute right-0 top-12 w-80 z-50"
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <GlassCard variant="strong" className="p-4 rounded-2xl max-h-96 overflow-y-auto no-scrollbar" animate={false}>
                <p className="font-heading text-sm font-bold mb-3">Messages from your idols</p>
                {notifications.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No messages yet</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`glass-subtle rounded-xl p-3 ${!n.is_read ? 'ring-1 ring-purple-400/30' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-heading font-semibold text-purple-500 uppercase tracking-wider">
                            {n.idol_name}
                          </span>
                          <span className="text-[9px] text-muted-foreground/60">
                            {n.sent_date ? format(new Date(n.sent_date), 'MMM d') : ''}
                          </span>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed">{n.message}</p>
                        {n.progress !== undefined && (
                          <div className="mt-2 flex items-center gap-1">
                            <div className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-teal-400"
                                style={{ width: `${n.progress}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-muted-foreground">{n.progress}%</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}