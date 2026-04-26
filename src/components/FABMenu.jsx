import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Camera, CheckSquare } from 'lucide-react';

const MENU_ITEMS = [
  {
    id: 'goal',
    label: 'New Goal',
    icon: Target,
    angle: -150,
    gradient: 'from-purple-500 to-blue-500',
  },
  {
    id: 'milestone',
    label: 'Milestone',
    icon: Camera,
    angle: -90,
    gradient: 'from-teal-400 to-emerald-500',
  },
  {
    id: 'task',
    label: 'New Task',
    icon: CheckSquare,
    angle: -30,
    gradient: 'from-pink-400 to-rose-500',
  },
];

const RADIUS = 88;
const HOLD_MS = 380;

export default function FABMenu({ onSelect }) {
  const [open, setOpen] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [fabPos, setFabPos] = useState({ x: 0, y: 0 });
  const holdTimer = useRef(null);
  const fabRef = useRef(null);

  const openMenu = useCallback(() => {
    if (!fabRef.current) return;
    const rect = fabRef.current.getBoundingClientRect();
    setFabPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    setOpen(true);
    setPressing(false);
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setPressing(false);
  }, []);

  const handlePointerDown = (e) => {
    e.preventDefault();
    setPressing(true);
    holdTimer.current = setTimeout(openMenu, HOLD_MS);
  };

  const handlePointerUp = () => {
    clearTimeout(holdTimer.current);
    setPressing(false);
  };

  const handlePointerLeave = () => {
    clearTimeout(holdTimer.current);
    setPressing(false);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMenu}
            style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(6px)' }}
          />
        )}
      </AnimatePresence>

      {/* Radial menu items — anchored to FAB center */}
      <AnimatePresence>
        {open && MENU_ITEMS.map((item, i) => {
          const rad = (item.angle * Math.PI) / 180;
          const x = fabPos.x + Math.cos(rad) * RADIUS;
          const y = fabPos.y + Math.sin(rad) * RADIUS;
          return (
            <motion.div
              key={item.id}
              className="fixed z-50 flex flex-col items-center gap-1"
              style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.3 }}
              transition={{ type: 'spring', stiffness: 440, damping: 30, delay: i * 0.04 }}
            >
              <button
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-xl`}
                style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => { closeMenu(); onSelect(item.id); }}
              >
                <item.icon className="w-5 h-5 text-white" />
              </button>
              <span
                className="text-[10px] font-heading font-bold whitespace-nowrap px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(0,0,0,0.45)',
                  color: '#fff',
                  backdropFilter: 'blur(4px)',
                  letterSpacing: '0.04em',
                }}
              >
                {item.label}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* FAB */}
      <div ref={fabRef} className="relative flex items-center justify-center" style={{ width: 56, height: 56, marginTop: -28 }}>
        {/* Subtle idle ripple — stays inside nav, doesn't overlay button */}
        {!open && !pressing && (
          <motion.span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: 'rgba(167,139,250,0.35)' }}
            animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
        )}

        {/* Hold-progress ring */}
        {pressing && (
          <motion.span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ border: '2.5px solid rgba(255,255,255,0.8)' }}
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: HOLD_MS / 1000, ease: 'linear' }}
          />
        )}

        <motion.button
          className="relative w-14 h-14 rounded-full flex items-center justify-center select-none z-50"
          style={{
            background: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 50%, #3b82f6 100%)',
            boxShadow: open
              ? '0 0 0 3px rgba(167,139,250,0.5), 0 12px 32px rgba(99,102,241,0.45)'
              : '0 6px 20px rgba(99,102,241,0.4)',
            touchAction: 'none',
          }}
          animate={{ rotate: open ? 45 : 0, scale: pressing ? 0.9 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        >
          {/* Inner highlight */}
          <span className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.28) 0%, transparent 60%)' }} />
          <Plus className="w-6 h-6 text-white relative z-10" strokeWidth={2.5} />
        </motion.button>
      </div>
    </>
  );
}