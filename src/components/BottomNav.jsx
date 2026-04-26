import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Home, Target, CalendarCheck, Radio, Sparkles, Camera, CheckSquare, ArrowRight } from 'lucide-react';

const NAV_ITEMS_LEFT  = [
  { path: '/',      icon: Home,          label: 'Home'  },
  { path: '/goals', icon: Target,        label: 'Goals' },
];
const NAV_ITEMS_RIGHT = [
  { path: '/tasks', icon: CalendarCheck, label: 'Tasks' },
  { path: '/feed',  icon: Radio,         label: 'Feed'  },
];

const ACTIONS = [
  { id: 'goal',      label: 'Goal',      icon: Sparkles,    color: '#a78bfa', bg: 'linear-gradient(135deg,#a78bfa,#6366f1)' },
  { id: 'milestone', label: 'Milestone', icon: Camera,      color: '#34d399', bg: 'linear-gradient(135deg,#34d399,#0ea5e9)' },
  { id: 'task',      label: 'Task',      icon: CheckSquare, color: '#f472b6', bg: 'linear-gradient(135deg,#f472b6,#fb7185)' },
];

const ns = {
  userSelect: 'none',
  WebkitUserSelect: 'none',
  WebkitTouchCallout: 'none',
  WebkitTapHighlightColor: 'transparent',
  touchAction: 'manipulation',
};

export default function BottomNav({ onSelect }) {
  const [active, setActive] = useState(null); // null = idle, 0/1/2 = index
  const location = useLocation();

  const current = active !== null ? ACTIONS[active] : null;
  const Icon = current?.icon;

  const handleDialTap = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (active === null) {
      setActive(0);
    } else {
      setActive((v) => (v + 1) % ACTIONS.length);
    }
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (current) {
      onSelect(current.id);
      setActive(null);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(null);
  };

  const renderNavItem = (item) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        draggable={false}
        className="flex flex-col items-center justify-center flex-1 h-full gap-1"
        style={ns}
      >
        <item.icon
          className="w-5 h-5 pointer-events-none"
          style={{ color: isActive ? '#7c3aed' : 'rgba(120,100,160,0.45)', transition: 'color 0.2s' }}
          strokeWidth={isActive ? 2.2 : 1.8}
        />
        <span
          className="text-[9px] font-heading font-semibold pointer-events-none"
          style={{ color: isActive ? '#7c3aed' : 'rgba(120,100,160,0.4)', letterSpacing: '0.05em' }}
        >
          {item.label}
        </span>
        {isActive && (
          <motion.div
            layoutId="dot"
            className="absolute bottom-2 w-1 h-1 rounded-full"
            style={{ background: '#7c3aed' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
      </Link>
    );
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-5"
      style={ns}
    >
      <div
        className="flex items-center max-w-sm mx-auto"
        style={{
          height: 68,
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.32)',
          borderRadius: 26,
          boxShadow: '0 12px 48px rgba(80,40,140,0.13), inset 0 1.5px 0 rgba(255,255,255,0.55)',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {/* Left nav */}
        <div className="flex flex-1 items-center h-full relative">
          {NAV_ITEMS_LEFT.map(renderNavItem)}
        </div>

        {/* ── CENTER DIAL AREA ── */}
        <div className="flex flex-col items-center justify-center" style={{ width: 100, flexShrink: 0, ...ns }}>

          {/* Label that appears above dial when active */}
          <AnimatePresence mode="wait">
            {current && (
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute pointer-events-none"
                style={{ top: -30, left: '50%', transform: 'translateX(-50%)', zIndex: 60 }}
              >
                <span
                  className="text-[10px] font-heading font-bold whitespace-nowrap px-3 py-1 rounded-full"
                  style={{
                    background: current.bg,
                    color: '#fff',
                    letterSpacing: '0.08em',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                  }}
                >
                  + {current.label}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2" style={ns}>

            {/* Cancel — only visible when active */}
            <AnimatePresence>
              {active !== null && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                  onClick={handleCancel}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.08)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    ...ns,
                  }}
                >
                  <span style={{ fontSize: 13, color: 'rgba(80,60,120,0.7)', fontWeight: 700, lineHeight: 1 }}>✕</span>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Main dial button */}
            <motion.button
              onClick={handleDialTap}
              style={{
                width: 52, height: 52, borderRadius: 16,
                background: current ? current.bg : 'linear-gradient(135deg,#a78bfa,#6366f1,#3b82f6)',
                boxShadow: current
                  ? `0 6px 20px ${current.color}66`
                  : '0 6px 20px rgba(99,102,241,0.4)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
                transition: 'background 0.25s, box-shadow 0.25s',
                ...ns,
              }}
              whileTap={{ scale: 0.88 }}
            >
              {/* Sheen */}
              <span
                style={{
                  position: 'absolute', inset: 0, borderRadius: 16, pointerEvents: 'none',
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.28) 0%, transparent 55%)',
                }}
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={active ?? 'idle'}
                  initial={{ rotate: -60, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 60, opacity: 0, scale: 0.6 }}
                  transition={{ type: 'spring', stiffness: 460, damping: 24 }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {Icon
                    ? <Icon className="pointer-events-none" style={{ width: 22, height: 22, color: '#fff' }} />
                    : <span style={{ fontSize: 22, color: '#fff', fontWeight: 300, lineHeight: 1 }}>+</span>
                  }
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* Confirm arrow — only visible when active */}
            <AnimatePresence>
              {active !== null && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                  onClick={handleConfirm}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: current?.bg,
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 10px ${current?.color}55`,
                    ...ns,
                  }}
                >
                  <ArrowRight className="pointer-events-none" style={{ width: 14, height: 14, color: '#fff' }} />
                </motion.button>
              )}
            </AnimatePresence>

          </div>

          {/* Step dots */}
          <div className="flex gap-1 mt-1.5" style={{ height: 6, ...ns }}>
            {ACTIONS.map((a, i) => (
              <motion.div
                key={a.id}
                animate={{
                  width: active === i ? 14 : 4,
                  background: active === i ? a.color : 'rgba(160,140,200,0.3)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                style={{ height: 4, borderRadius: 4 }}
              />
            ))}
          </div>
        </div>

        {/* Right nav */}
        <div className="flex flex-1 items-center h-full relative">
          {NAV_ITEMS_RIGHT.map(renderNavItem)}
        </div>
      </div>
    </div>
  );
}