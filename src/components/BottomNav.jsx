import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Home, Target, User, Plus } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav({ onAddGoal }) {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-2">
      <div className="glass-strong rounded-2xl px-2 py-2 flex items-center justify-around max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className="relative flex flex-col items-center py-2 px-4">
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
        })}

        <motion.button
          className="relative flex flex-col items-center py-1.5 px-3"
          whileTap={{ scale: 0.9 }}
          onClick={onAddGoal}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Plus className="w-5 h-5 text-white" />
          </div>
        </motion.button>
      </div>
    </div>
  );
}