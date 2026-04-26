import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ThreeBackground from '@/components/ThreeBackground';
import GlassCard from '@/components/ui/GlassCard';
import PageShell from '@/components/PageShell';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, addMonths, subMonths, parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock } from 'lucide-react';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function Tasks() {
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-due_date'),
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list('-created_date'),
  });

  const toggleTaskMutation = useMutation({
    mutationFn: (task) =>
      base44.entities.Task.update(task.id, { status: task.status === 'done' ? 'pending' : 'done' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // pad to start on Sunday
  const startPad = monthStart.getDay();
  const paddedDays = [
    ...Array(startPad).fill(null),
    ...calDays,
  ];

  const tasksOnDate = (date) =>
    tasks.filter(t => t.due_date && isSameDay(parseISO(t.due_date), date));

  const selectedTasks = tasksOnDate(selectedDate).sort((a, b) => {
    if (!a.due_time) return 1;
    if (!b.due_time) return -1;
    return a.due_time.localeCompare(b.due_time);
  });

  return (
    <div className="min-h-screen relative pb-28">
      <PageShell goals={goals} user={user}>
      <ThreeBackground />
      <div className="relative z-10 px-4 pt-14">

        {/* Header */}
        <motion.h1
          className="font-heading text-3xl font-bold text-foreground mb-6 px-2"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Tasks
        </motion.h1>

        {/* Calendar */}
        <GlassCard variant="strong" className="p-4 mb-4 rounded-3xl" animate={false}>
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="glass-subtle rounded-full p-1.5">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-heading font-bold text-base">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="glass-subtle rounded-full p-1.5">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-heading font-semibold text-muted-foreground py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-1">
            {paddedDays.map((day, i) => {
              if (!day) return <div key={`pad-${i}`} />;
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const hasTasks = tasksOnDate(day).length > 0;
              const tasksDone = tasksOnDate(day).filter(t => t.status === 'done').length;
              const allDone = hasTasks && tasksDone === tasksOnDate(day).length;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`relative flex flex-col items-center justify-center rounded-xl py-1.5 transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br from-violet-400 to-indigo-400 shadow-md shadow-violet-300/40'
                      : isToday
                      ? 'glass border border-violet-300/50'
                      : 'hover:bg-white/40'
                  }`}
                >
                  <span className={`text-sm font-heading font-semibold ${
                    isSelected ? 'text-white' : isToday ? 'text-violet-500' : 'text-foreground'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {hasTasks && (
                    <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                      allDone ? 'bg-indigo-400' : isSelected ? 'bg-white' : 'bg-pink-400'
                    }`} />
                  )}
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* Selected day tasks */}
        <div className="px-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs tracking-widest uppercase text-muted-foreground font-heading">
              {format(selectedDate, 'EEE, MMM d')}
            </p>
            <span className="text-xs text-muted-foreground">{selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}</span>
          </div>

          <AnimatePresence>
            {selectedTasks.length === 0 ? (
              <GlassCard className="p-6 text-center" animate={false}>
                <p className="text-muted-foreground text-sm">No tasks for this day</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Tap + to add one</p>
              </GlassCard>
            ) : (
              <div className="space-y-2">
                {selectedTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <GlassCard className="p-4 flex items-start gap-3" animate={false}>
                      <button
                        onClick={() => toggleTaskMutation.mutate(task)}
                        className="mt-0.5 shrink-0"
                      >
                        {task.status === 'done'
                          ? <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                          : <Circle className="w-5 h-5 text-muted-foreground" />
                        }
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-heading font-semibold text-sm ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {task.due_time && (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="w-3 h-3" />{task.due_time}
                            </span>
                          )}
                          {task.goal_title && (
                            <span className="text-[10px] glass-subtle rounded-full px-2 py-0.5 text-violet-500 font-heading font-medium">
                              {task.goal_title}
                            </span>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      </PageShell>
    </div>
  );
}