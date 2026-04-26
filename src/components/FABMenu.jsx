import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Camera, CheckSquare } from 'lucide-react';

const MENU_ITEMS = [
  { id: 'goal',      label: 'New Goal',   icon: Target,      angle: -150, gradient: 'from-purple-500 to-blue-500' },
  { id: 'milestone', label: 'Milestone',  icon: Camera,      angle: -90,  gradient: 'from-teal-400 to-emerald-500' },
  { id: 'task',      label: 'New Task',   icon: CheckSquare, angle: -30,  gradient: 'from-pink-400 to-rose-500' },
];

const RADIUS = 90;
const HOLD_MS = 380;

export default function FABMenu({ onSelect }) {
  const [open, setOpen] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [fabPos, setFabPos] = useState({ x: 0, y: 0 });
  const holdTimer = useRef(null);
  const fabRef = useRef(null);
  const btnRef = useRef(null);

  // Attach non-passive touchstart so we can call preventDefault and block native selection
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const onTouchStart = (e) => {
      e.preventDefault(); // blocks long-press selection & context menu
      setPressing(true);
      const rect = btn.getBoundingClientRect();
      holdTimer.current = setTimeout(() => {
        setFabPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
        setOpen(true);
        setPressing(false);
      }, HOLD_MS);
    };

    const onTouchEnd = (e) => {
      e.preventDefault();
      clearTimeout(holdTimer.current);
      setPressing(false);
    };

    const onContextMenu = (e) => e.preventDefault();

    btn.addEventListener('touchstart', onTouchStart, { passive: false });
    btn.addEventListener('touchend', onTouchEnd, { passive: false });
    btn.addEventListener('touchcancel', onTouchEnd, { passive: false });
    btn.addEventListener('contextmenu', onContextMenu);

    return () => {
      btn.removeEventListener('touchstart', onTouchStart);
      btn.removeEventListener('touchend', onTouchEnd);
      btn.removeEventListener('touchcancel', onTouchEnd);
      btn.removeEventListener('contextmenu', onContextMenu);
    };
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setPressing(false);
  }, []);

  // Mouse support (desktop)
  const handleMouseDown = (e) => {
    e.preventDefault();
    setPressing(true);
    const rect = btnRef.current.getBoundingClientRect();
    holdTimer.current = setTimeout(() => {
      setFabPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      setOpen(true);
      setPressing(false);
    }, HOLD_MS);
  };

  const handleMouseUp = () => {
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
            onPointerDown={closeMenu}
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(6px)' }}
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
              className="fixed z-50 flex flex-col items-center gap-1"
              style={{
                left: x, top: y,
                transform: 'translate(-50%, -50%)',
                touchAction: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.3 }}
              transition={{ type: 'spring', stiffness: 440, damping: 30, delay: i * 0.04 }}
            >
              <button
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center`}
                style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.3)', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onContextMenu={(e) => e.preventDefault()}
                onClick={() => { closeMenu(); onSelect(item.id); }}
              >
                <item.icon className="w-5 h-5 text-white pointer-events-none" />
              </button>
              <span
                className="text-[10px] font-heading font-bold whitespace-nowrap px-2 py-0.5 rounded-full pointer-events-none"
                style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', backdropFilter: 'blur(4px)', letterSpacing: '0.04em', userSelect: 'none', WebkitUserSelect: 'none' }}
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
        style={{ width: 56, height: 56, marginTop: -28, touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        {/* Idle ripple */}
        {!open && !pressing && (
          <motion.span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: 'rgba(167,139,250,0.35)' }}
            animate={{ scale: [1, 1.65], opacity: [0.5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
        )}

        {/* Hold-progress ring */}
        {pressing && (
          <motion.span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ border: '2.5px solid rgba(255,255,255,0.85)' }}
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.45, opacity: 0 }}
            transition={{ duration: HOLD_MS / 1000, ease: 'linear' }}
          />
        )}

        <motion.button
          ref={btnRef}
          className="relative w-14 h-14 rounded-full flex items-center justify-center z-50"
          style={{
            background: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 50%, #3b82f6 100%)',
            boxShadow: open
              ? '0 0 0 3px rgba(167,139,250,0.5), 0 12px 32px rgba(99,102,241,0.45)'
              : '0 6px 20px rgba(99,102,241,0.4)',
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
          }}
          animate={{ rotate: open ? 45 : 0, scale: pressing ? 0.9 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onContextMenu={(e) => e.preventDefault()}
        >
          <span className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.28) 0%, transparent 60%)' }} />
          <Plus className="w-6 h-6 text-white relative z-10 pointer-events-none" strokeWidth={2.5} />
        </motion.button>
      </div>
    </>
  );
}