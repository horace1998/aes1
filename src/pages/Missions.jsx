import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ThreeBackground from '@/components/ThreeBackground';
import GlassCard from '@/components/ui/GlassCard';
import PageShell from '@/components/PageShell';
import MissionCard from '@/components/missions/MissionCard';
import { Users, Flame, TrendingUp } from 'lucide-react';

export default function Missions() {
  const [filterGroup, setFilterGroup] = useState('all');
  const [tab, setTab] = useState('trending'); // trending | new | mine

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: missions = [], isLoading } = useQuery({
    queryKey: ['missions'],
    queryFn: () => base44.entities.Mission.filter(
      { status: 'active', moderation_status: 'approved' },
      '-created_date',
      100
    ),
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list('-created_date'),
  });

  const groups = ['all', ...new Set(missions.map(m => m.idol_group).filter(Boolean))];

  let filtered = filterGroup === 'all' ? missions : missions.filter(m => m.idol_group === filterGroup);

  if (tab === 'trending') {
    filtered = [...filtered].sort((a, b) => (b.member_count || 0) - (a.member_count || 0));
  } else if (tab === 'mine') {
    filtered = filtered.filter(m =>
      m.creator_email === user?.email ||
      (m.members || []).some(mb => mb.user_email === user?.email)
    );
  }

  return (
    <div className="min-h-screen relative pb-28">
      <PageShell goals={goals} user={user}>
        <ThreeBackground />

        <div className="relative z-10 px-6 pt-14">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="mb-5"
          >
            <p className="text-xs tracking-widest uppercase text-muted-foreground font-heading mb-1">Squad up</p>
            <h1 className="font-display text-5xl tracking-wide uppercase text-foreground">
              Missions
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Join fans worldwide on shared journeys</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {[
              { id: 'trending', label: 'Trending', icon: Flame },
              { id: 'new', label: 'New', icon: TrendingUp },
              { id: 'mine', label: 'Mine', icon: Users },
            ].map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 rounded-xl py-2 text-[11px] font-heading font-semibold transition-all flex items-center justify-center gap-1 ${
                    tab === t.id
                      ? 'bg-foreground text-background'
                      : 'border border-foreground/15 text-muted-foreground'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Group filter pills */}
          {groups.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
              {groups.map(g => (
                <button
                  key={g}
                  onClick={() => setFilterGroup(g)}
                  className={`rounded-full px-3 py-1.5 text-xs font-heading font-medium flex-shrink-0 transition-all ${
                    filterGroup === g
                      ? 'bg-foreground text-background'
                      : 'border border-foreground/15 text-muted-foreground'
                  }`}
                >
                  {g === 'all' ? 'All Groups' : g}
                </button>
              ))}
            </div>
          )}

          {/* List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="glass rounded-2xl h-36 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-heading font-semibold mb-1">No missions yet</p>
              <p className="text-sm text-muted-foreground">
                Create a goal and toggle "Public mission" to be the first!
              </p>
            </GlassCard>
          ) : (
            <div>
              {filtered.map((m, i) => (
                <MissionCard key={m.id} mission={m} currentUser={user} index={i} />
              ))}
            </div>
          )}
        </div>
      </PageShell>
    </div>
  );
}