import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ThreeBackground from '@/components/ThreeBackground';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import MilestoneCard from '@/components/milestones/MilestoneCard';
import MilestoneUploadModal from '@/components/milestones/MilestoneUploadModal';
import PageShell from '@/components/PageShell';
import { Trophy, Plus, Grid, List, ImageIcon } from 'lucide-react';

export default function MilestoneGallery() {
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [user, setUser] = useState(null);
  const [filterIdol, setFilterIdol] = useState('all');

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ['milestones'],
    queryFn: () => base44.entities.Milestone.list('-created_date'),
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list('-created_date'),
  });

  // Unique idols from milestones for filtering
  const idols = ['all', ...new Set(milestones.map(m => m.idol_name).filter(Boolean))];

  const filtered = filterIdol === 'all'
    ? milestones
    : milestones.filter(m => m.idol_name === filterIdol);

  const handleAddMilestone = (goal = null) => {
    setSelectedGoal(goal);
    setShowUpload(true);
  };

  return (
    <div className="min-h-screen relative pb-28">
      <PageShell goals={goals} user={user}>
      <ThreeBackground />

      <div className="relative z-10 px-6 pt-14">
        {/* Header */}
        <motion.div
          className="flex items-start justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          <div>
            <p className="text-xs tracking-widest uppercase text-muted-foreground font-heading mb-1">Station Archive</p>
            <h1 className="font-heading text-3xl font-bold text-foreground">Milestone Gallery</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`glass-subtle rounded-xl p-2.5 ${viewMode === 'grid' ? 'ring-1 ring-violet-300/60' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              className={`glass-subtle rounded-xl p-2.5 ${viewMode === 'list' ? 'ring-1 ring-violet-300/60' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Stats banner */}
        <GlassCard variant="strong" className="p-4 mb-6 flex items-center justify-between">
          <div className="text-center flex-1">
            <p className="font-heading text-2xl font-bold text-violet-500">{milestones.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Milestones</p>
          </div>
          <div className="w-px h-10 bg-white/30" />
          <div className="text-center flex-1">
            <p className="font-heading text-2xl font-bold text-indigo-500">
              {new Set(milestones.map(m => m.idol_name)).size}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Idols</p>
          </div>
          <div className="w-px h-10 bg-white/30" />
          <div className="text-center flex-1">
            <p className="font-heading text-2xl font-bold text-pink-500">
              {new Set(milestones.map(m => m.goal_id)).size}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Goals</p>
          </div>
        </GlassCard>

        {/* Add milestone from goal */}
        {goals.filter(g => g.status === 'active').length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-heading mb-2">
              Add milestone for a goal
            </p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {goals.filter(g => g.status === 'active').map(goal => (
                <motion.button
                  key={goal.id}
                  className="glass-subtle rounded-xl px-3 py-2 flex-shrink-0 text-left"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAddMilestone(goal)}
                >
                  <p className="text-xs font-heading font-semibold whitespace-nowrap">{goal.idol_name}</p>
                  <p className="text-[10px] text-muted-foreground whitespace-nowrap max-w-28 truncate">{goal.title}</p>
                </motion.button>
              ))}
              <motion.button
                className="glass rounded-xl px-4 py-2 flex items-center gap-2 flex-shrink-0"
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAddMilestone(null)}
              >
                <Plus className="w-4 h-4 text-violet-500" />
                <span className="text-xs font-heading text-muted-foreground">Free upload</span>
              </motion.button>
            </div>
          </div>
        )}

        {/* Idol filter */}
        {idols.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
            {idols.map(idol => (
              <button
                key={idol}
                className={`rounded-full px-3 py-1.5 text-xs font-heading font-medium capitalize flex-shrink-0 transition-all ${
                  filterIdol === idol
                    ? 'bg-gradient-to-r from-violet-400 to-indigo-400 text-white shadow-md'
                    : 'glass-subtle text-muted-foreground'
                }`}
                onClick={() => setFilterIdol(idol)}
              >
                {idol}
              </button>
            ))}
          </div>
        )}

        {/* Gallery */}
        {isLoading ? (
          <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="glass rounded-2xl aspect-square animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <GlassCard className="p-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <Trophy className="w-10 h-10 text-violet-300 mx-auto mb-3" />
            </motion.div>
            <p className="font-heading font-semibold mb-1">No milestones yet</p>
            <p className="text-sm text-muted-foreground mb-5">
              Complete a goal and upload your fandom asset to celebrate!
            </p>
            <GlassButton variant="primary" onClick={() => handleAddMilestone(null)} className="flex items-center gap-2 mx-auto">
              <ImageIcon className="w-4 h-4" /> Upload First Milestone
            </GlassButton>
          </GlassCard>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              {filtered.map((milestone, i) => (
                <MilestoneCard key={milestone.id} milestone={milestone} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <MilestoneUploadModal
        isOpen={showUpload}
        onClose={() => { setShowUpload(false); setSelectedGoal(null); }}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['milestones'] })}
        goal={selectedGoal}
      />
      </PageShell>
    </div>
  );
}