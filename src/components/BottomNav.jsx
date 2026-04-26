import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Home, Target, CalendarCheck, Radio, Plus, X, Sparkles, Camera, CheckSquare } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/',      icon: Home,         label: 'Home'  },
  { path: '/goals', icon: Target,       label: 'Goals' },
  { path: '/tasks', icon: CalendarCheck,label: 'Tasks' },
  { path: '/feed',  icon: Radio,        label: 'Feed'  },
];

const ACTION_ITEMS = [
  { id: 'goal',      label: 'New Goal',      icon: Sparkles,   gradient: ['#a78bfa', '#6366f1'] },
  { id: 'milestone', label: 'New Milestone', icon: Camera,     gradient: ['#34d399', '#0ea5e9'] },
  { id: 'task',      label: 'New Task',      icon: CheckSquare,gradient: ['#f472b6', '#fb7185'] },
];

const noSelect = {
  userSelect: 'none',
  WebkitUserSelect: 'none',
  WebkitTouchCallout: 'none',
  WebkitTapHighlightColor: 'transparent',
};

export default function BottomNav({ onSelect }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const handleAction = (id) => {
    setOpen(false);
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
            onClick={() => setOpen(false)}
            style={{ background: 'rgba(10,6,30,0.45)', backdropFilter: 'blur(12px)', ...noSelect }}
          />
        )}
      </AnimatePresence>

      {/* Action Sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed left-0 right-0 z-50 flex justify-center"
            style={{ bottom: 96, ...noSelect }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <div
              className="flex gap-4 px-6 py-4 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.13)',
                backdropFilter: 'blur(28px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.22)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.22), inset 0 1.5px 0 rgba(255,255,255,0.4)',
              }}
            >
              {ACTION_ITEMS.map((item, i) => (
                <motion.button
                  key={item.id}
                  className="flex flex-col items-center gap-2"
                  style={noSelect}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 14 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 400, damping: 28 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAction(item.id)}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
                      boxShadow: `0 8px 24px ${item.gradient[1]}55`,
                    }}
                  >
                    <item.icon className="w-6 h-6 text-white pointer-events-none" />
                  </div>
                  <span
                    className="text-[10px] font-heading font-semibold"
                    style={{ color: 'rgba(255,255,255,0.85)', letterSpacing: '0.04em', ...noSelect }}
                  >
                    {item.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-5 pt-2"
        style={noSelect}
      >
        <div
          className="flex items-center max-w-sm mx-auto px-3"
          style={{
            height: 64,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(32px) saturate(200%)',
            border: '1px solid rgba(255,255,255,0.28)',
            borderRadius: 24,
            boxShadow: '0 12px 40px rgba(80,40,140,0.12), inset 0 1.5px 0 rgba(255,255,255,0.5)',
          }}
        >
          {/* Left 2 nav items */}
          {NAV_ITEMS.slice(0, 2).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center justify-center flex-1 h-full"
                style={noSelect}
                draggable={false}
              >
                <motion.div
                  className="flex flex-col items-center gap-1"
                  animate={{ y: isActive ? -1 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navPill"
                      className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: 'linear-gradient(135deg, #a78bfa, #6366f1)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon
                    className="w-5 h-5 pointer-events-none"
                    style={{ color: isActive ? '#7c3aed' : 'rgba(100,80,140,0.5)' }}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span
                    className="text-[9px] font-heading font-semibold pointer-events-none"
                    style={{ color: isActive ? '#7c3aed' : 'rgba(100,80,140,0.45)', letterSpacing: '0.05em' }}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}

          {/* Center + button */}
          <div className="flex items-center justify-center px-2" style={{ flexShrink: 0 }}>
            <motion.button
              className="relative flex items-center justify-center rounded-2xl"
              style={{
                width: 50,
                height: 50,
                background: open
                  ? 'linear-gradient(135deg, #1e1040, #2d1b69)'
                  : 'linear-gradient(135deg, #a78bfa 0%, #6366f1 55%, #3b82f6 100%)',
                boxShadow: open
                  ? '0 4px 16px rgba(30,16,64,0.4)'
                  : '0 6px 22px rgba(99,102,241,0.45)',
                ...noSelect,
              }}
              animate={{ rotate: open ? 45 : 0 }}
              whileTap={{ scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              onClick={() => setOpen((v) => !v)}
            >
              <span
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.28) 0%, transparent 55%)' }}
              />
              {open
                ? <X className="w-5 h-5 text-white relative z-10 pointer-events-none" strokeWidth={2.5} />
                : <Plus className="w-5 h-5 text-white relative z-10 pointer-events-none" strokeWidth={2.5} />
              }
            </motion.button>
          </div>

          {/* Right 2 nav items */}
          {NAV_ITEMS.slice(2).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center justify-center flex-1 h-full"
                style={noSelect}
                draggable={false}
              >
                <motion.div
                  className="flex flex-col items-center gap-1"
                  animate={{ y: isActive ? -1 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navPill"
                      className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: 'linear-gradient(135deg, #a78bfa, #6366f1)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon
                    className="w-5 h-5 pointer-events-none"
                    style={{ color: isActive ? '#7c3aed' : 'rgba(100,80,140,0.5)' }}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span
                    className="text-[9px] font-heading font-semibold pointer-events-none"
                    style={{ color: isActive ? '#7c3aed' : 'rgba(100,80,140,0.45)', letterSpacing: '0.05em' }}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}