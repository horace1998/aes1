import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { Users, Sparkles, Calendar, Loader2, Check, Flag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import ReportDialog from '@/components/feed/ReportDialog';

const CATEGORY_COLORS = {
  fitness: 'from-rose-300 to-pink-300',
  study: 'from-indigo-300 to-violet-300',
  wellness: 'from-emerald-300 to-teal-300',
  creative: 'from-violet-300 to-fuchsia-300',
  lifestyle: 'from-sky-300 to-indigo-300',
  other: 'from-violet-300 to-indigo-300',
};

export default function MissionCard({ mission, currentUser, index = 0 }) {
  const queryClient = useQueryClient();
  const [joining, setJoining] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const isMember = (mission.members || []).some(m => m.user_email === currentUser?.email);
  const isCreator = mission.creator_email === currentUser?.email;

  const handleJoin = async () => {
    if (!currentUser || isMember || isCreator) return;
    setJoining(true);
    try {
      const res = await base44.functions.invoke('joinMission', { mission_id: mission.id });
      if (res?.data?.success) {
        toast.success(`Joined! "${mission.title}" added to your goals 💜`);
        queryClient.invalidateQueries({ queryKey: ['missions'] });
        queryClient.invalidateQueries({ queryKey: ['goals'] });
      } else {
        toast.error(res?.data?.error || 'Could not join');
      }
    } catch (e) {
      toast.error('Could not join mission');
    }
    setJoining(false);
  };

  const gradient = CATEGORY_COLORS[mission.category] || CATEGORY_COLORS.other;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26, delay: index * 0.05 }}
      >
        <GlassCard variant="strong" className="p-5 mb-3" animate={false}>
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading text-base font-bold leading-snug">{mission.title}</p>
              <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider mt-0.5">
                by {mission.creator_name || mission.creator_email?.split('@')[0]}
                {mission.idol_group ? ` · ${mission.idol_group}` : ''}
              </p>
            </div>
            <button
              onClick={() => setReportOpen(true)}
              className="glass-subtle rounded-full p-1.5 text-muted-foreground hover:text-pink-500 transition-colors"
              aria-label="Report"
            >
              <Flag className="w-3 h-3" />
            </button>
          </div>

          {mission.description && (
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{mission.description}</p>
          )}

          <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-heading mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {mission.timeline_value} {mission.timeline_unit}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {mission.member_count || 1} {mission.member_count === 1 ? 'fan' : 'fans'}
            </span>
          </div>

          {isCreator ? (
            <div className="glass-subtle rounded-xl py-2 text-center text-[11px] font-heading text-violet-500">
              Your mission · {mission.member_count || 1} joined
            </div>
          ) : isMember ? (
            <div className="glass-subtle rounded-xl py-2 text-center text-[11px] font-heading text-emerald-500 flex items-center justify-center gap-1">
              <Check className="w-3.5 h-3.5" /> Joined
            </div>
          ) : (
            <GlassButton variant="primary" onClick={handleJoin} disabled={joining} className="w-full py-2 text-xs">
              {joining ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Join Mission'}
            </GlassButton>
          )}
        </GlassCard>
      </motion.div>

      <ReportDialog
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="mission"
        targetId={mission.id}
        snapshot={`${mission.title} — ${mission.description || ''}`}
      />
    </>
  );
}