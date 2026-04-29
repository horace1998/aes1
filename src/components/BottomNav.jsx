import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Radio, Plus, Camera, CheckSquare, Trophy, User } from 'lucide-react';

const NAV_ITEMS_LEFT = [
  { path: '/',         icon: Home,  label: 'Home'     },
  { path: '/missions', icon: Users, label: 'Missions' },
];
const NAV_ITEMS_RIGHT = [
  { path: '/feed',    icon: Radio, label: 'Feed'    },
  { path: '/profile', icon: User,  label: 'Profile' },
];

const ACTIONS = [
  { id: 'goal',      label: 'Entry',     icon: Trophy,      bg: '#0a0a0a', shadow: 'rgba(0,0,0,0.18)' },
  { id: 'milestone', label: 'Capture',   icon: Camera,      bg: '#0a0a0a', shadow: 'rgba(0,0,0,0.18)' },
  { id: 'task',      label: 'Note',      icon: CheckSquare, bg: '#0a0a0a', shadow: 'rgba(0,0,0,0.18)' },
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
          className="w-[18px] h-[18px] pointer-events-none"
          style={{ color: isActive ? '#0a0a0a' : 'rgba(0,0,0,0.35)', transition: 'color 0.2s' }}
          strokeWidth={isActive ? 1.8 : 1.4}
        />
        <span
          className="text-[9px] pointer-events-none"
          style={{
            color: isActive ? '#0a0a0a' : 'rgba(0,0,0,0.4)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: isActive ? 600 : 500,
          }}
        >
          {item.label}
        </span>
        {isActive && (
          <motion.div
            layoutId="dot"
            className="absolute bottom-1 w-3 h-px"
            style={{ background: '#0a0a0a' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
      </Link>
    );
  };

  const content = (
    <div className="fixed bottom-0 left-0 right-0 z-[60] px-4 pb-5" style={ns}>

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
                      width: 58, height: 58, borderRadius: 6,
                      background: action.bg,
                      boxShadow: `0 8px 22px ${action.shadow}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <Icon style={{ width: 22, height: 22, color: '#fff', pointerEvents: 'none' }} strokeWidth={1.6} />
                  </div>
                  <span
                    className="text-[10px]"
                    style={{
                      color: '#0a0a0a',
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      pointerEvents: 'none',
                    }}
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
          height: 62, position: 'relative', zIndex: 50,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(24px) saturate(115%)',
          WebkitBackdropFilter: 'blur(24px) saturate(115%)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
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
              width: 46, height: 46, borderRadius: 6,
              background: '#0a0a0a',
              boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
              transition: 'background 0.25s, box-shadow 0.25s',
              ...ns,
            }}
          >
            <Plus style={{ width: 20, height: 20, color: '#fff', pointerEvents: 'none' }} strokeWidth={1.8} />
          </motion.button>
        </div>

        <div className="flex flex-1 items-center h-full">
          {NAV_ITEMS_RIGHT.map(renderNavItem)}
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
}