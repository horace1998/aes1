import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ImageIcon, Heart } from 'lucide-react';

const ASSET_TYPE_COLORS = {
  badge: 'from-violet-200/40 to-indigo-200/40',
  fanart: 'from-pink-200/40 to-violet-200/40',
  photo: 'from-sky-200/40 to-indigo-200/40',
  sticker: 'from-pink-200/40 to-rose-200/40',
};

export default function MilestoneCard({ milestone, index = 0 }) {
  const date = milestone.created_date
    ? format(new Date(milestone.created_date), 'MMM d, yyyy')
    : '';

  return (
    <motion.div
      className="glass rounded-2xl overflow-hidden"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26, delay: index * 0.07 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      {/* Asset image */}
      <div className={`relative bg-gradient-to-br ${ASSET_TYPE_COLORS[milestone.asset_type] || ASSET_TYPE_COLORS.badge} aspect-square`}>
        {milestone.asset_url ? (
          <img
            src={milestone.asset_url}
            alt={milestone.goal_title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-violet-300/70" />
          </div>
        )}
        {/* Type badge */}
        <div className="absolute top-2 right-2 glass-strong rounded-full px-2 py-0.5">
          <span className="text-[9px] font-heading font-bold uppercase tracking-wider text-foreground">
            {milestone.asset_type}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-heading font-semibold text-xs text-foreground line-clamp-1 mb-0.5">
          {milestone.goal_title}
        </p>
        <div className="flex items-center gap-1 mb-1.5">
          <Heart className="w-3 h-3 text-pink-400" />
          <span className="text-[10px] text-muted-foreground">{milestone.idol_name}</span>
        </div>
        {milestone.caption && (
          <p className="text-[10px] text-muted-foreground line-clamp-2 italic">
            "{milestone.caption}"
          </p>
        )}
        {date && (
          <p className="text-[9px] text-muted-foreground/60 mt-1.5">{date}</p>
        )}
      </div>
    </motion.div>
  );
}