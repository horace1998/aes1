import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Camera, CheckSquare } from 'lucide-react';

const MENU_ITEMS = [
  {
    id: 'goal',
    label: 'New Goal',
    icon: Target,
    angle: -140,
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
    angle: -40,
    gradient: 'from-pink-400 to-rose-500',
    shadow: 'shadow-pink-400/40',
  },
];

const RADIUS = 90;

export default function FABMenu({ onSelect }) {
  const [open, setOpen] = useState(false);
  const holdTimer = useRef(null);
  const [held, setHeld] = useState(false);

  const openMenu = () => {
    setOpen(true);
    setHeld(true);
  };

  const closeMenu = () => {
    setOpen(false);
    setHeld(false);
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    holdTimer.current = setTimeout(() => {
      openMenu();
    }, 180);
  };

  const handlePointerUp = (e) => {
    clearTimeout(holdTimer.current);
    if (!held) {
      // short tap — treat as new goal
      onSelect('goal');
    }
  };

  const handlePointerLeave = () => {
    clearTimeout(holdTimer.current);
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
            style={{ background: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(4px)' }}
          />
        )}
      </AnimatePresence>

      {/* Radial menu items */}
      <AnimatePresence>
        {open && MENU_ITEMS.map((item, i) => {
          const rad = (item.angle * Math.PI) / 180;
          const x = Math.cos(rad) * RADIUS;
          const y = Math.sin(rad) * RADIUS;
          return (
            <motion.div
              key={item.id}
              className="fixed z-50 flex flex-col items-center"
              style={{
                bottom: `calc(2.5rem + 56px + ${-y}px)`,
                left: `calc(50% + ${x}px)`,
                transform: 'translateX(-50%)',
              }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28, delay: i * 0.04 }}
            >
              <button
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg ${item.shadow} mb-1`}
                onClick={() => handleSelect(item.id)}
              >
                <item.icon className="w-5 h-5 text-white" />
              </button>
              <span className="text-[10px] font-heading font-semibold text-white drop-shadow-md whitespace-nowrap">
                {item.label}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* FAB button */}
      <motion.button
        className={`relative w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-xl shadow-purple-500/35 z-50 -mt-7 select-none`}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        style={{ touchAction: 'none' }}
      >
        <Plus className="w-6 h-6 text-white" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
      </motion.button>
    </>
  );
}