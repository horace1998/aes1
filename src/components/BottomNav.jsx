import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Home, Target, CalendarCheck, Radio, Plus, X, Sparkles, Camera, CheckSquare, ArrowRight } from 'lucide-react';

const NAV_ITEMS_LEFT  = [
  { path: '/',      icon: Home,           label: 'Home'  },
  { path: '/goals', icon: Target,         label: 'Goals' },
];
const NAV_ITEMS_RIGHT = [
  { path: '/tasks', icon: CalendarCheck,  label: 'Tasks' },
  { path: '/feed',  icon: Radio,          label: 'Feed'  },
];

const ACTIONS = [
  { id: 'goal',      label: 'New Goal',      icon: Sparkles,    color: '#a78bfa', bg: 'linear-gradient(135deg,#a78bfa,#6366f1)' },
  { id: 'milestone', label: 'New Milestone', icon: Camera,      color: '#34d399', bg: 'linear-gradient(135deg,#34d399,#0ea5e9)' },
  { id: 'task',      label: 'New Task',      icon: CheckSquare, color: '#f472b6', bg: 'linear-gradient(135deg,#f472b6,#fb7185)' },
];

const ns = {
  userSelect: 'none',
  WebkitUserSelect: 'none',
  WebkitTouchCallout: 'none',
  WebkitTapHighlightColor: 'transparent',
  touchAction: 'manipulation',
};

export default function BottomNav({ onSelect }) {
  const [active, setActive] = useState(null);
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
        className="relative flex flex-col items-center justify-center flex-1 h-full gap-1"
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
            className="absolute bottom-1.5 w-1 h-1 rounded-full"
            style={{ background: '#7c3aed' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
      </Link>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-5" style={ns}>

      {/* ── FLOATING SELECTOR — appears above nav bar ── */}
      <AnimatePresence>
        {active !== null && (
          <motion.div
            key="selector"
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="flex items-center justify-center mb-3"
            style={ns}
          >
            <div
              className="flex items-center gap-4 px-5 py-3.5 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(32px) saturate(200%)',
                WebkitBackdropFilter: 'blur(32px) saturate(200%)',
                border: '1px solid rgba(255,255,255,0.38)',
                boxShadow: '0 16px 48px rgba(80,40,140,0.18), inset 0 1.5px 0 rgba(255,255,255,0.55)',
              }}
            >
              {/* Cancel */}
              <motion.button
                onClick={handleCancel}
                whileTap={{ scale: 0.85 }}
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.07)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  ...ns,
                }}
              >
                <X style={{ width: 14, height: 14, color: 'rgba(80,60,120,0.6)', pointerEvents: 'none' }} />
              </motion.button>

              {/* Spinning icon button + label */}
              <div className="flex flex-col items-center gap-1.5" style={ns}>
                <motion.button
                  onClick={handleDialTap}
                  whileTap={{ scale: 0.88 }}
                  style={{
                    width: 56, height: 56, borderRadius: 18,
                    background: current?.bg,
                    boxShadow: `0 8px 24px ${current?.color}55`,
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', overflow: 'hidden',
                    ...ns,
                  }}
                >
                  <span style={{
                    position: 'absolute', inset: 0, borderRadius: 18, pointerEvents: 'none',
                    background: 'linear-gradient(160deg,rgba(255,255,255,0.28) 0%,transparent 55%)',
                  }} />
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active}
                      initial={{ rotate: -60, opacity: 0, scale: 0.5 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: 60, opacity: 0, scale: 0.5 }}
                      transition={{ type: 'spring', stiffness: 460, damping: 24 }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {Icon && <Icon style={{ width: 24, height: 24, color: '#fff', pointerEvents: 'none' }} />}
                    </motion.div>
                  </AnimatePresence>
                </motion.button>

                {/* Label */}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={current?.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="font-heading font-bold text-[11px] whitespace-nowrap pointer-events-none"
                    style={{ color: current?.color, letterSpacing: '0.06em' }}
                  >
                    {current?.label}
                  </motion.span>
                </AnimatePresence>

                {/* Step dots */}
                <div className="flex gap-1" style={ns}>
                  {ACTIONS.map((a, i) => (
                    <motion.div
                      key={a.id}
                      animate={{ width: active === i ? 16 : 4, background: active === i ? a.color : 'rgba(160,140,200,0.3)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      style={{ height: 4, borderRadius: 4 }}
                    />
                  ))}
                </div>
              </div>

              {/* Confirm */}
              <motion.button
                onClick={handleConfirm}
                whileTap={{ scale: 0.85 }}
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: current?.bg,
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 4px 14px ${current?.color}55`,
                  ...ns,
                }}
              >
                <ArrowRight style={{ width: 16, height: 16, color: '#fff', pointerEvents: 'none' }} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NAV BAR ── */}
      <div
        className="flex items-center max-w-sm mx-auto px-3"
        style={{
          height: 64,
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.32)',
          borderRadius: 26,
          boxShadow: '0 12px 40px rgba(80,40,140,0.12), inset 0 1.5px 0 rgba(255,255,255,0.55)',
        }}
      >
        {/* Left */}
        <div className="flex flex-1 items-center h-full">
          {NAV_ITEMS_LEFT.map(renderNavItem)}
        </div>

        {/* Center + button (clean, just the pill) */}
        <div className="flex items-center justify-center px-2" style={{ flexShrink: 0, ...ns }}>
          <motion.button
            onClick={handleDialTap}
            whileTap={{ scale: 0.88 }}
            style={{
              width: 48, height: 48, borderRadius: 15,
              background: current
                ? current.bg
                : 'linear-gradient(135deg,#a78bfa 0%,#6366f1 55%,#3b82f6 100%)',
              boxShadow: current
                ? `0 6px 20px ${current.color}55`
                : '0 6px 20px rgba(99,102,241,0.4)',
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

        {/* Right */}
        <div className="flex flex-1 items-center h-full">
          {NAV_ITEMS_RIGHT.map(renderNavItem)}
        </div>
      </div>
    </div>
  );
}