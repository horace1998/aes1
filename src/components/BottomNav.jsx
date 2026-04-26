import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Home, Target, CalendarCheck, Radio, Plus, X, Trophy, Camera, CheckSquare } from 'lucide-react';

const NAV_ITEMS_LEFT = [
  { path: '/',      icon: Home,          label: 'Home'  },
  { path: '/goals', icon: Target,        label: 'Goals' },
];
const NAV_ITEMS_RIGHT = [
  { path: '/tasks', icon: CalendarCheck, label: 'Tasks' },
  { path: '/feed',  icon: Radio,         label: 'Feed'  },
];

const ACTIONS = [
  { id: 'goal',      label: 'Goal',      icon: Trophy,      bg: 'linear-gradient(135deg,#7dd3fc,#0284c7)', shadow: 'rgba(56,189,248,0.45)' },
  { id: 'milestone', label: 'Milestone', icon: Camera,      bg: 'linear-gradient(135deg,#67e8f9,#0891b2)', shadow: 'rgba(34,211,238,0.45)' },
  { id: 'task',      label: 'Task',      icon: CheckSquare, bg: 'linear-gradient(135deg,#93c5fd,#2563eb)', shadow: 'rgba(96,165,250,0.45)' },
];

const ns = {
  userSelect: 'none',
  WebkitUserSelect: 'none',
  WebkitTouchCallout: 'none',
  WebkitTapHighlightColor: 'transparent',
  touchAction: 'manipulation',
};

export default function BottomNav({ onSelect }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const handleAction = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    onSelect(id);
  };

  const renderNavItem = (item) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        draggable={false}
        className="relative flex flex-col items-center justify-center flex-1 h-full gap-1"
        style={ns}
      >
        <item.icon
          className="w-5 h-5 pointer-events-none"
          style={{ color: isActive ? '#0284c7' : 'rgba(70,110,150,0.5)', transition: 'color 0.2s' }}
          strokeWidth={isActive ? 2.2 : 1.8}
        />
        <span
          className="text-[9px] font-heading font-semibold pointer-events-none"
          style={{ color: isActive ? '#0284c7' : 'rgba(70,110,150,0.45)', letterSpacing: '0.05em' }}
        >
          {item.label}
        </span>
        {isActive && (
          <motion.div
            layoutId="dot"
            className="absolute bottom-1.5 w-1 h-1 rounded-full"
            style={{ background: '#0284c7' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
      </Link>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-5" style={ns}>

      {/* ── BACKDROP to close ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{ background: 'rgba(0,0,0,0.08)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
          />
        )}
      </AnimatePresence>

      {/* ── POPUP OPTIONS ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="popup"
            className="flex items-end justify-center gap-4 mb-4"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            style={{ zIndex: 50, position: 'relative' }}
          >
            {ACTIONS.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  onClick={(e) => handleAction(e, action.id)}
                  initial={{ opacity: 0, y: 20, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 28, delay: i * 0.05 }}
                  whileTap={{ scale: 0.88 }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    cursor: 'pointer', background: 'none', border: 'none',
                    ...ns,
                  }}
                >
                  <div
                    style={{
                      width: 60, height: 60, borderRadius: 20,
                      background: action.bg,
                      boxShadow: `0 10px 28px ${action.shadow}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative', overflow: 'hidden',
                    }}
                  >
                    <span style={{
                      position: 'absolute', inset: 0, borderRadius: 20, pointerEvents: 'none',
                      background: 'linear-gradient(160deg,rgba(255,255,255,0.3) 0%,transparent 55%)',
                    }} />
                    <Icon style={{ width: 26, height: 26, color: '#fff', pointerEvents: 'none' }} />
                  </div>
                  <span
                    className="font-heading font-semibold text-[11px]"
                    style={{ color: '#075985', letterSpacing: '0.04em', pointerEvents: 'none' }}
                  >
                    {action.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NAV BAR ── */}
      <div
        className="flex items-center max-w-sm mx-auto px-3"
        style={{
          height: 64, position: 'relative', zIndex: 50,
          background: 'rgba(255,255,255,0.22)',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.45)',
          borderRadius: 26,
          boxShadow: '0 12px 40px rgba(14,165,233,0.18), inset 0 1.5px 0 rgba(255,255,255,0.7)',
        }}
      >
        <div className="flex flex-1 items-center h-full">
          {NAV_ITEMS_LEFT.map(renderNavItem)}
        </div>

        {/* Center + button */}
        <div className="flex items-center justify-center px-2" style={{ flexShrink: 0, ...ns }}>
          <motion.button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(v => !v); }}
            whileTap={{ scale: 0.88 }}
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
            style={{
              width: 48, height: 48, borderRadius: 15,
              background: open
                ? 'linear-gradient(135deg,#f87171,#ef4444)'
                : 'linear-gradient(135deg,#7dd3fc 0%,#0ea5e9 55%,#0284c7 100%)',
              boxShadow: open
                ? '0 6px 20px rgba(239,68,68,0.4)'
                : '0 6px 20px rgba(14,165,233,0.5)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
              transition: 'background 0.25s, box-shadow 0.25s',
              ...ns,
            }}
          >
            <span style={{
              position: 'absolute', inset: 0, borderRadius: 15, pointerEvents: 'none',
              background: 'linear-gradient(160deg,rgba(255,255,255,0.28) 0%,transparent 55%)',
            }} />
            <Plus style={{ width: 22, height: 22, color: '#fff', pointerEvents: 'none' }} strokeWidth={2.5} />
          </motion.button>
        </div>

        <div className="flex flex-1 items-center h-full">
          {NAV_ITEMS_RIGHT.map(renderNavItem)}
        </div>
      </div>
    </div>
  );
}