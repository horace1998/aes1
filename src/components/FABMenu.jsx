import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Camera, CheckSquare } from 'lucide-react';

const MENU_ITEMS = [
  { id: 'goal',      label: 'New Goal',   icon: Target,      angle: -150, gradient: 'from-purple-500 to-blue-500' },
  { id: 'milestone', label: 'Milestone',  icon: Camera,      angle: -90,  gradient: 'from-teal-400 to-emerald-500' },
  { id: 'task',      label: 'New Task',   icon: CheckSquare, angle: -30,  gradient: 'from-pink-400 to-rose-500' },
];

const RADIUS = 90;

export default function FABMenu({ onSelect }) {
  const [open, setOpen] = useState(false);
  const [fabPos, setFabPos] = useState({ x: 0, y: 0 });
  const fabRef = useRef(null);

  const toggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!open && fabRef.current) {
      const rect = fabRef.current.getBoundingClientRect();
      setFabPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
    setOpen((v) => !v);
  };

  const closeMenu = () => setOpen(false);

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
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}
          />
        )}
      </AnimatePresence>

      {/* Radial menu items */}
      <AnimatePresence>
        {open && MENU_ITEMS.map((item, i) => {
          const rad = (item.angle * Math.PI) / 180;
          const x = fabPos.x + Math.cos(rad) * RADIUS;
          const y = fabPos.y + Math.sin(rad) * RADIUS;
          return (
            <motion.div
              key={item.id}
              className="fixed z-50 flex flex-col items-center gap-1.5"
              style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
              initial={{ opacity: 0, scale: 0.4, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.4, y: 10 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28, delay: i * 0.05 }}
            >
              <motion.button
                className={`w-13 h-13 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-2xl`}
                style={{
                  width: 52, height: 52,
                  boxShadow: '0 8px 28px rgba(0,0,0,0.28)',
                }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); closeMenu(); onSelect(item.id); }}
              >
                <item.icon className="w-5 h-5 text-white pointer-events-none" />
              </motion.button>
              <span
                className="text-[10px] font-heading font-bold whitespace-nowrap px-2.5 py-1 rounded-full pointer-events-none"
                style={{
                  background: 'rgba(20,10,40,0.6)',
                  color: '#fff',
                  backdropFilter: 'blur(6px)',
                  letterSpacing: '0.05em',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                {item.label}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* FAB */}
      <div
        ref={fabRef}
        className="relative flex items-center justify-center"
        style={{ width: 56, height: 56, marginTop: -28 }}
      >
        {/* Idle pulse ring */}
        {!open && (
          <motion.span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: 'rgba(167,139,250,0.4)' }}
            animate={{ scale: [1, 1.7], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}

        <motion.button
          className="relative w-14 h-14 rounded-full flex items-center justify-center z-50"
          style={{
            background: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 50%, #3b82f6 100%)',
            boxShadow: open
              ? '0 0 0 3px rgba(167,139,250,0.5), 0 12px 32px rgba(99,102,241,0.5)'
              : '0 6px 20px rgba(99,102,241,0.45)',
          }}
          animate={{ rotate: open ? 45 : 0 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          onClick={toggleMenu}
        >
          <span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.3) 0%, transparent 60%)' }}
          />
          <Plus className="w-6 h-6 text-white relative z-10 pointer-events-none" strokeWidth={2.5} />
        </motion.button>
      </div>
    </>
  );
}