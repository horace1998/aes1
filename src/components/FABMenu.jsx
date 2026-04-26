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
    shadow: 'shadow-purple-500/40',
  },
  {
    id: 'milestone',
    label: 'Milestone',
    icon: Camera,
    angle: -90,
    gradient: 'from-teal-400 to-emerald-500',
    shadow: 'shadow-teal-400/40',
  },
  {
    id: 'task',
    label: 'New Task',
    icon: CheckSquare,
    angle: -30,
    gradient: 'from-pink-400 to-rose-500',
    shadow: 'shadow-pink-400/40',
  },
];

const RADIUS = 88;
const HOLD_MS = 350;

export default function FABMenu({ onSelect }) {
  const [open, setOpen] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [fabPos, setFabPos] = useState({ x: 0, y: 0 });
  const holdTimer = useRef(null);
  const fabRef = useRef(null);
  const didOpen = useRef(false);

  const openMenu = useCallback(() => {
    if (!fabRef.current) return;
    const rect = fabRef.current.getBoundingClientRect();
    setFabPos({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    didOpen.current = true;
    setOpen(true);
    setPressing(false);
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setPressing(false);
    didOpen.current = false;
  }, []);

  const handlePointerDown = (e) => {
    e.preventDefault();
    didOpen.current = false;
    setPressing(true);
    holdTimer.current = setTimeout(openMenu, HOLD_MS);
  };

  const handlePointerUp = () => {
    clearTimeout(holdTimer.current);
    setPressing(false);
    // short tap — do nothing, only hold opens the menu
  };

  const handlePointerLeave = () => {
    clearTimeout(holdTimer.current);
    setPressing(false);
  };

  const handleSelect = (id) => {
    closeMenu();
    onSelect(id);
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
            style={{ background: 'rgba(0,0,0,0.22)', backdropFilter: 'blur(5px)' }}
          />
        )}
      </AnimatePresence>

      {/* Radial menu items — anchored to measured FAB center */}
      <AnimatePresence>
        {open && MENU_ITEMS.map((item, i) => {
          const rad = (item.angle * Math.PI) / 180;
          const x = fabPos.x + Math.cos(rad) * RADIUS;
          const y = fabPos.y + Math.sin(rad) * RADIUS;
          return (
            <motion.div
              key={item.id}
              className="fixed z-50 flex flex-col items-center"
              style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.3 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28, delay: i * 0.04 }}
            >
              <button
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg ${item.shadow} mb-1`}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => handleSelect(item.id)}
              >
                <item.icon className="w-5 h-5 text-white" />
              </button>
              <span className="text-[10px] font-heading font-semibold text-white drop-shadow-md whitespace-nowrap"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                {item.label}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* FAB button */}
      <div className="relative flex items-center justify-center" ref={fabRef}>
        {/* Pulse ring hint — visible when not open */}
        <AnimatePresence>
          {!open && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: '2px solid rgba(167,139,250,0.5)' }}
              animate={{ scale: [1, 1.55, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </AnimatePresence>

        {/* Press progress ring */}
        <AnimatePresence>
          {pressing && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                border: '3px solid rgba(167,139,250,0.9)',
                boxShadow: '0 0 12px rgba(167,139,250,0.6)',
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.25, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: HOLD_MS / 1000, ease: 'linear' }}
            />
          )}
        </AnimatePresence>

        <motion.button
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-xl shadow-purple-500/35 z-50 -mt-7 select-none"
          animate={{ rotate: open ? 45 : 0, scale: pressing ? 0.92 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          style={{ touchAction: 'none' }}
        >
          <Plus className="w-6 h-6 text-white" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
        </motion.button>

        {/* "Hold" hint label */}
        {!open && (
          <motion.span
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-heading font-semibold text-muted-foreground whitespace-nowrap pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            hold
          </motion.span>
        )}
      </div>
    </>
  );
}