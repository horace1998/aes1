import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import ModalPortal from '@/components/ui/ModalPortal';
import { X, Target, Heart, Users, Sparkles } from 'lucide-react';

const TIMELINE_UNITS = ['days', 'weeks', 'months'];
const CATEGORIES = [
  { id: 'fitness', label: 'Fitness' },
  { id: 'study', label: 'Study' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'creative', label: 'Creative' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'other', label: 'Other' },
];

export default function NewGoalModal({ isOpen, onClose, onSave, defaultIdol }) {
  const [goal, setGoal] = useState('');
  const [description, setDescription] = useState('');
  const [timelineValue, setTimelineValue] = useState(7);
  const [timelineUnit, setTimelineUnit] = useState('days');
  const [makePublic, setMakePublic] = useState(false);
  const [category, setCategory] = useState('other');

  const idolName = defaultIdol?.idol_name?.trim() || defaultIdol?.idol_group?.trim() || '';
  const idolGroup = defaultIdol?.idol_group?.trim() || '';
  const hasFocus = !!idolGroup;

  const handleSave = () => {
    if (!goal.trim() || !hasFocus) return;
    onSave({
      title: goal.trim(),
      description: description.trim(),
      idol_name: idolName,
      idol_group: idolGroup,
      timeline_value: timelineValue,
      timeline_unit: timelineUnit,
      start_date: new Date().toISOString().split('T')[0],
      status: 'active',
      progress: 0,
      daily_checkins: [],
      make_public: makePublic,
      category,
    });
    setGoal('');
    setDescription('');
    setTimelineValue(7);
    setTimelineUnit('days');
    setMakePublic(false);
    setCategory('other');
  };

  return (
    <ModalPortal>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom))', paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-lg max-h-full"
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <GlassCard variant="strong" className="p-5 rounded-3xl max-h-full overflow-y-auto no-scrollbar" animate={false}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading text-xl font-bold">New Goal</h3>
                <button onClick={onClose} className="glass-subtle rounded-full p-2">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!hasFocus ? (
                <div className="text-center py-6">
                  <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">No focus picked yet.</p>
                  <p className="text-xs text-muted-foreground">Set your group/bias in Profile first.</p>
                </div>
              ) : (
                <>
                  <div className="iridescent rounded-xl p-4 glass mb-4 text-center">
                    <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider mb-1.5">My Pledge</p>
                    <p className="font-heading text-sm font-bold text-foreground leading-snug">
                      Before I meet <span className="text-violet-500">{idolName}</span>, I will{' '}
                      <span className="text-indigo-500">{goal || '...'}</span>{' '}
                      for the next{' '}
                      <span className="text-violet-500">{timelineValue} {timelineUnit}</span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="glass-subtle rounded-xl p-3">
                      <label className="text-[10px] tracking-widest uppercase text-muted-foreground font-heading block mb-1">
                        <Target className="w-3 h-3 inline mr-1" />Goal
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Exercise every day"
                        maxLength={120}
                        className="w-full bg-transparent outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/40"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                      />
                    </div>

                    <div className="glass-subtle rounded-xl p-3">
                      <label className="text-[10px] tracking-widest uppercase text-muted-foreground font-heading block mb-2">Timeline</label>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            className="w-7 h-7 rounded-full glass flex items-center justify-center text-sm font-bold"
                            onClick={() => setTimelineValue(Math.max(1, timelineValue - 1))}
                          >−</button>
                          <span className="font-heading font-bold text-xl w-8 text-center">{timelineValue}</span>
                          <button
                            className="w-7 h-7 rounded-full glass flex items-center justify-center text-sm font-bold"
                            onClick={() => setTimelineValue(timelineValue + 1)}
                          >+</button>
                        </div>
                        <div className="flex gap-1.5 flex-1">
                          {TIMELINE_UNITS.map(unit => (
                            <button
                              key={unit}
                              className={`flex-1 rounded-lg py-1.5 text-[10px] font-heading font-medium capitalize transition-all ${
                                timelineUnit === unit
                                  ? 'bg-gradient-to-r from-violet-400 to-indigo-400 text-white'
                                  : 'glass text-muted-foreground'
                              }`}
                              onClick={() => setTimelineUnit(unit)}
                            >
                              {unit}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Public mission toggle */}
                    <button
                      onClick={() => setMakePublic(p => !p)}
                      className={`w-full rounded-xl p-3 flex items-center gap-3 text-left transition-all ${
                        makePublic ? 'bg-gradient-to-r from-violet-100 to-pink-100 ring-1 ring-violet-300/60' : 'glass-subtle'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        makePublic ? 'bg-gradient-to-br from-violet-400 to-pink-400' : 'glass'
                      }`}>
                        <Users className={`w-4 h-4 ${makePublic ? 'text-white' : 'text-violet-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-heading font-bold">Make this a public mission</p>
                        <p className="text-[10px] text-muted-foreground">Other fans can join you on this journey 💜</p>
                      </div>
                      <div className={`w-9 h-5 rounded-full transition-all flex items-center ${makePublic ? 'bg-violet-400' : 'bg-slate-300'}`}>
                        <motion.div
                          className="w-4 h-4 bg-white rounded-full shadow-md"
                          animate={{ x: makePublic ? 18 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </div>
                    </button>

                    {/* Public mission extras */}
                    <AnimatePresence>
                      {makePublic && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 overflow-hidden"
                        >
                          <div className="glass-subtle rounded-xl p-3">
                            <label className="text-[10px] tracking-widest uppercase text-muted-foreground font-heading block mb-1">
                              <Sparkles className="w-3 h-3 inline mr-1" />Why join? (optional)
                            </label>
                            <textarea
                              rows={2}
                              maxLength={200}
                              placeholder="Tell other fans why this mission matters..."
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              className="w-full bg-transparent outline-none text-xs font-medium resize-none placeholder:text-muted-foreground/40"
                            />
                          </div>

                          <div className="glass-subtle rounded-xl p-3">
                            <label className="text-[10px] tracking-widest uppercase text-muted-foreground font-heading block mb-2">Category</label>
                            <div className="flex gap-1.5 flex-wrap">
                              {CATEGORIES.map(c => (
                                <button
                                  key={c.id}
                                  onClick={() => setCategory(c.id)}
                                  className={`rounded-full px-2.5 py-1 text-[10px] font-heading font-medium transition-all ${
                                    category === c.id
                                      ? 'bg-gradient-to-r from-violet-400 to-indigo-400 text-white'
                                      : 'glass text-muted-foreground'
                                  }`}
                                >
                                  {c.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}

              <div className="flex gap-3 mt-6">
                <GlassButton variant="ghost" onClick={onClose} className="flex-1">Cancel</GlassButton>
                <GlassButton variant="primary" onClick={handleSave} disabled={!goal.trim() || !hasFocus} className="flex-1">
                  Create Goal
                </GlassButton>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </ModalPortal>
  );
}