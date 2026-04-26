import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { Search, Star, ChevronRight } from 'lucide-react';

const IDOL_DATA = [
  { name: 'Jungkook', group: 'BTS', img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop' },
  { name: 'Lisa', group: 'BLACKPINK', img: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop' },
  { name: 'Felix', group: 'Stray Kids', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
  { name: 'Wonyoung', group: 'IVE', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop' },
  { name: 'Taehyung', group: 'BTS', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop' },
  { name: 'Jennie', group: 'BLACKPINK', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop' },
  { name: 'Hyunjin', group: 'Stray Kids', img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop' },
  { name: 'Karina', group: 'aespa', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop' },
];

export default function OnboardingIdol({ onNext, onBack }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [customName, setCustomName] = useState('');
  const [customGroup, setCustomGroup] = useState('');

  const filtered = IDOL_DATA.filter(idol =>
    idol.name.toLowerCase().includes(search.toLowerCase()) ||
    idol.group.toLowerCase().includes(search.toLowerCase())
  );

  const handleContinue = () => {
    if (selected) {
      onNext({ idol_name: selected.name, idol_group: selected.group });
    } else if (customName.trim()) {
      onNext({ idol_name: customName.trim(), idol_group: customGroup.trim() || 'Unknown' });
    }
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

      <GlassCard className="flex items-center gap-3 px-4 py-3 mb-6" animate={false}>
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search idols or groups..."
          className="bg-transparent flex-1 outline-none text-sm text-foreground placeholder:text-muted-foreground/50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </GlassCard>

      <div className="grid grid-cols-2 gap-3 mb-6 max-h-[340px] overflow-y-auto no-scrollbar">
        <AnimatePresence mode="popLayout">
          {filtered.map((idol, i) => (
            <motion.div
              key={idol.name}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.05 }}
            >
              <div
                className={`glass rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
                  selected?.name === idol.name
                    ? 'ring-2 ring-purple-500 bg-white/40'
                    : 'hover:bg-white/30'
                }`}
                onClick={() => { setSelected(idol); setCustomName(''); setCustomGroup(''); }}
              >
                <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-3 ring-2 ring-white/30">
                  <img src={idol.img} alt={idol.name} className="w-full h-full object-cover" />
                </div>
                <p className="font-heading font-semibold text-sm text-center">{idol.name}</p>
                <p className="text-xs text-muted-foreground text-center">{idol.group}</p>
                {selected?.name === idol.name && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex justify-center mt-2"
                  >
                    <Star className="w-4 h-4 text-purple-500 fill-purple-500" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <GlassCard className="p-4 mb-6" animate={false}>
        <p className="text-xs text-muted-foreground mb-3 font-heading uppercase tracking-wider">Or enter custom idol</p>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Idol name"
            className="glass-subtle rounded-xl px-3 py-2 flex-1 text-sm outline-none text-foreground placeholder:text-muted-foreground/50"
            value={customName}
            onChange={(e) => { setCustomName(e.target.value); setSelected(null); }}
          />
          <input
            type="text"
            placeholder="Group"
            className="glass-subtle rounded-xl px-3 py-2 w-28 text-sm outline-none text-foreground placeholder:text-muted-foreground/50"
            value={customGroup}
            onChange={(e) => setCustomGroup(e.target.value)}
          />
        </div>
      </GlassCard>

      <div className="flex gap-3">
        <GlassButton variant="ghost" onClick={onBack} className="flex-1">Back</GlassButton>
        <GlassButton
          variant="primary"
          onClick={handleContinue}
          disabled={!selected && !customName.trim()}
          className="flex-1 flex items-center justify-center gap-2"
        >
          Continue <ChevronRight className="w-4 h-4" />
        </GlassButton>
      </div>
    </motion.div>
  );
}