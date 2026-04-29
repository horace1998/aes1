import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addMonths, subMonths } from 'date-fns';
import { Clock, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import GlassCard from '@/components/ui/GlassCard';

export default function CalendarWidget({ tasks = [], selectedDate, onDateSelect, onNewTask }) {
  const [viewMode, setViewMode] = useState('monthly');
  const [displayMonth, setDisplayMonth] = useState(selectedDate);

  const monthStart = startOfMonth(displayMonth);
  const monthEnd = endOfMonth(displayMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Grid layout: pad start of month
  const firstDayOfWeek = getDay(monthStart);
  const padding = Array(firstDayOfWeek).fill(null);
  const calendarDays = [...padding, ...monthDays];

  // Group into weeks
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const getDayTasks = (date) => {
    if (!date) return [];
    return tasks.filter(t => t.due_date && isSameDay(new Date(t.due_date), date));
  };

  return (
    <GlassCard variant="strong" className="p-6 mb-6" animate={false}>
      {/* Header with toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-4 py-1.5 rounded-full text-sm font-heading font-bold transition-all ${
              viewMode === 'weekly'
                ? 'bg-foreground text-background'
                : 'text-foreground/50'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-1.5 rounded-full text-sm font-heading font-bold transition-all ${
              viewMode === 'monthly'
                ? 'bg-foreground text-background'
                : 'text-foreground/50'
            }`}
          >
            Monthly
          </button>
        </div>
        {/* Settings icon placeholder */}
        <div className="w-6 h-6 rounded-full border border-foreground/20" />
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setDisplayMonth(subMonths(displayMonth, 1))}
          className="p-2 hover:bg-foreground/10 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
        <h2 className="text-5xl font-display font-bold text-foreground">
          {format(displayMonth, 'MMM').toUpperCase()}
        </h2>
        <button
          onClick={() => setDisplayMonth(addMonths(displayMonth, 1))}
          className="p-2 hover:bg-foreground/10 rounded-lg transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="mb-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="text-center text-xs font-heading font-bold text-foreground/50">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2">
          {weeks.map((week, wi) =>
            week.map((date, di) => {
              const isSelected = date && isSameDay(date, selectedDate);
              const dayTasks = date ? getDayTasks(date) : [];

              return (
                <button
                   key={`${wi}-${di}`}
                   onClick={() => date && onDateSelect(date)}
                   disabled={!date}
                   className={`aspect-square rounded-lg flex items-center justify-center text-sm font-heading transition-all relative ${
                     !date
                       ? 'cursor-default'
                       : isSelected
                       ? 'bg-foreground text-background font-bold'
                       : dayTasks.length > 0
                       ? 'bg-primary/20 text-foreground font-bold'
                       : 'text-foreground'
                   }`}
                 >
                   {date && <span className="text-xs">{format(date, 'd')}</span>}
                 </button>
              );
            })
          )}
        </div>
      </div>



      {/* Task list for currently selected date */}
      {selectedDate && getDayTasks(selectedDate).length > 0 && (
        <div className="mt-6 pt-6 border-t border-foreground/10">
          <p className="text-[10px] font-heading font-bold text-foreground/50 mb-3">TASKS</p>
          <div className="space-y-2">
            {getDayTasks(selectedDate).map(task => (
              <motion.div
                key={task.id}
                className="w-full text-left flex items-start gap-2 p-2 rounded-lg bg-foreground/5"
              >
                <div className="w-4 h-4 rounded mt-0.5 border-2 border-foreground/20 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-heading text-foreground">
                    {task.title}
                  </p>
                  {task.due_time && (
                    <p className="text-[10px] text-foreground/40 mt-0.5">{task.due_time}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}