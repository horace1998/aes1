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
  { id: 'goal',      label: 'Goal',      icon: Trophy,      bg: 'linear-gradient(135deg,#c4b5fd,#a78bfa)', shadow: 'rgba(167,139,250,0.35)' },
  { id: 'milestone', label: 'Milestone', icon: Camera,      bg: 'linear-gradient(135deg,#bae6fd,#93c5fd)', shadow: 'rgba(147,197,253,0.35)' },
  { id: 'task',      label: 'Task',      icon: CheckSquare, bg: 'linear-gradient(135deg,#fbcfe8,#f9a8d4)', shadow: 'rgba(244,114,182,0.30)' },
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
          style={{ color: isActive ? '#6d4ed6' : 'rgba(90,85,120,0.55)', transition: 'color 0.2s' }}
          strokeWidth={isActive ? 2.2 : 1.8}
        />
        <span
          className="text-[9px] font-heading font-semibold pointer-events-none"
          style={{ color: isActive ? '#6d4ed6' : 'rgba(90,85,120,0.5)', letterSpacing: '0.05em' }}
        >
          {item.label}
        </span>
        {isActive && (
          <motion.div
            layoutId="dot"
            className="absolute bottom-1.5 w-1 h-1 rounded-full"
            style={{ background: '#6d4ed6' }}
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
            style={{ background: 'rgba(60,50,90,0.06)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
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
                    style={{ color: '#3f3a5c', letterSpacing: '0.04em', pointerEvents: 'none' }}
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
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(32px) saturate(150%)',
          WebkitBackdropFilter: 'blur(32px) saturate(150%)',
          border: '1px solid rgba(255,255,255,0.85)',
          borderRadius: 26,
          boxShadow: '0 10px 32px rgba(150,140,200,0.12), inset 0 1px 0 rgba(255,255,255,0.95)',
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
                ? 'linear-gradient(135deg,#f9a8d4,#f472b6)'
                : 'linear-gradient(135deg,#c4b5fd 0%,#a78bfa 55%,#8b7cf6 100%)',
              boxShadow: open
                ? '0 6px 20px rgba(244,114,182,0.35)'
                : '0 6px 20px rgba(167,139,250,0.4)',
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