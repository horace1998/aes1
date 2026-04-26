import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { ChevronRight, Heart, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KPOP_GROUPS } from '@/lib/kpopGroups';

export default function OnboardingIdol({ onNext, onBack }) {
  const [mode, setMode] = useState('list'); // 'list' | 'custom'
  const [groupName, setGroupName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [customGroup, setCustomGroup] = useState('');
  const [customName, setCustomName] = useState('');

  const selectedGroup = useMemo(
    () => KPOP_GROUPS.find((g) => g.name === groupName),
    [groupName]
  );

  const idolName = mode === 'list' ? memberName : customName.trim();
  const idolGroup = mode === 'list' ? groupName : customGroup.trim();
  const canContinue = !!idolName;

  const handleContinue = () => {
    if (!canContinue) return;
    onNext({
      idol_name: idolName,
      idol_group: idolGroup || 'Unknown',
    });
  };

  return (
    <motion.div
      className="min-h-screen px-6 pt-16 pb-8"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p className="text-xs tracking-widest uppercase text-muted-foreground font-heading mb-2">Step 1 of 2</p>
        <h2 className="font-heading text-3xl font-bold text-foreground mb-2">Choose your idol</h2>
        <p className="text-muted-foreground text-sm mb-6">Who inspires you to be your best self?</p>
      </motion.div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setMode('list')}
          className={`flex-1 rounded-xl px-3 py-2 text-xs font-heading uppercase tracking-wider transition ${
            mode === 'list' ? 'bg-violet-400 text-white shadow' : 'glass-subtle text-muted-foreground'
          }`}
        >
          Browse Groups
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`flex-1 rounded-xl px-3 py-2 text-xs font-heading uppercase tracking-wider transition ${
            mode === 'custom' ? 'bg-violet-400 text-white shadow' : 'glass-subtle text-muted-foreground'
          }`}
        >
          Custom
        </button>
      </div>

      {/* List mode — cascading dropdowns */}
      {mode === 'list' && (
        <GlassCard className="p-5 mb-6 space-y-4" animate={false}>
          <div>
            <label className="text-[10px] tracking-widest uppercase text-muted-foreground font-heading mb-1.5 block">
              K-pop Group
            </label>
            <Select
              value={groupName}
              onValueChange={(v) => { setGroupName(v); setMemberName(''); }}
            >
              <SelectTrigger className="w-full bg-white/60 border-white/70 rounded-xl">
                <SelectValue placeholder="Select a group..." />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {KPOP_GROUPS.map((g) => (
                  <SelectItem key={g.name} value={g.name}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[10px] tracking-widest uppercase text-muted-foreground font-heading mb-1.5 block">
              Member
            </label>
            <Select
              value={memberName}
              onValueChange={setMemberName}
              disabled={!selectedGroup}
            >
              <SelectTrigger className="w-full bg-white/60 border-white/70 rounded-xl disabled:opacity-50">
                <SelectValue placeholder={selectedGroup ? 'Select a member...' : 'Pick a group first'} />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {selectedGroup?.members.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </GlassCard>
      )}

      {/* Custom mode */}
      {mode === 'custom' && (
        <GlassCard className="p-5 mb-6 space-y-3" animate={false}>
          <div>
            <label className="text-[10px] tracking-widest uppercase text-muted-foreground font-heading mb-1.5 block">
              Idol Name
            </label>
            <input
              type="text"
              placeholder="e.g. Bang Chan"
              className="glass-subtle rounded-xl px-3 py-2 w-full text-sm outline-none text-foreground placeholder:text-muted-foreground/50"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] tracking-widest uppercase text-muted-foreground font-heading mb-1.5 block">
              Group
            </label>
            <input
              type="text"
              placeholder="e.g. Stray Kids"
              className="glass-subtle rounded-xl px-3 py-2 w-full text-sm outline-none text-foreground placeholder:text-muted-foreground/50"
              value={customGroup}
              onChange={(e) => setCustomGroup(e.target.value)}
            />
          </div>
        </GlassCard>
      )}

      {/* Live preview of "Your idol" */}
      <GlassCard variant="strong" className="p-5 mb-6 text-center" animate={false}>
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-heading">Your Idol</p>
        </div>
        {idolName ? (
          <motion.div
            key={idolName + idolGroup}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          >
            <p className="font-display text-3xl tracking-wide uppercase bg-gradient-to-r from-violet-500 to-pink-400 bg-clip-text text-transparent">
              {idolName}
            </p>
            {idolGroup && (
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
                <p className="text-xs text-muted-foreground font-heading">{idolGroup}</p>
              </div>
            )}
          </motion.div>
        ) : (
          <p className="text-sm text-muted-foreground/60 italic">Pick someone to see their name here</p>
        )}
      </GlassCard>

      <div className="flex gap-3">
        <GlassButton variant="ghost" onClick={onBack} className="flex-1">Back</GlassButton>
        <GlassButton
          variant="primary"
          onClick={handleContinue}
          disabled={!canContinue}
          className="flex-1 flex items-center justify-center gap-2"
        >
          Continue <ChevronRight className="w-4 h-4" />
        </GlassButton>
      </div>
    </motion.div>
  );
}