import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Home, Target, User, CalendarCheck, Radio } from 'lucide-react';
import FABMenu from '@/components/FABMenu';

const NAV_ITEMS_LEFT = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/goals', icon: Target, label: 'Goals' },
];
const NAV_ITEMS_RIGHT = [
  { path: '/tasks', icon: CalendarCheck, label: 'Tasks' },
  { path: '/feed', icon: Radio, label: 'Feed' },
];

export default function BottomNav({ onSelect }) {
  const location = useLocation();

  const renderItem = (item) => {
    const isActive = location.pathname === item.path;
    return (
      <Link key={item.path} to={item.path} className="relative flex flex-col items-center py-2 px-4 flex-1">
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/15 to-teal-400/15"
            layoutId="activeTab"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-500' : 'text-muted-foreground'} transition-colors relative z-10`} />
        <span className={`text-[10px] mt-1 font-heading ${isActive ? 'text-purple-500 font-semibold' : 'text-muted-foreground'} relative z-10`}>
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-2">
      <div className="glass-strong rounded-2xl px-2 flex items-center max-w-md mx-auto" style={{ height: 64 }}>
        {/* Left items */}
        <div className="flex flex-1 items-center">
          {NAV_ITEMS_LEFT.map(renderItem)}
        </div>

        {/* Center FAB */}
        <div className="flex items-center justify-center px-2">
          <FABMenu onSelect={onSelect} />
        </div>

        {/* Right items */}
        <div className="flex flex-1 items-center">
          {NAV_ITEMS_RIGHT.map(renderItem)}
        </div>
      </div>
    </div>
  );
}