/**
 * PageShell — wraps a page with FAB modals (NewGoal, Camera, Task).
 * The BottomNav itself is rendered ONCE at the App root (App.jsx) so it
 * doesn't unmount/remount on route changes. PageShell registers a handler
 * with NavActionContext so the global FAB knows which modals to open
 * for the current page (with the right `goals` / `user` context).
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NewGoalModal from '@/components/dashboard/NewGoalModal';
import TaskModal from '@/components/TaskModal';
import MilestoneNativeCapture from '@/components/MilestoneNativeCapture';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { useNavAction } from '@/lib/NavActionContext';

export default function PageShell({ children, goals = [], user }) {
  const [showGoal, setShowGoal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showTask, setShowTask] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { registerHandler } = useNavAction();

  useEffect(() => {
    registerHandler((id) => {
      if (id === 'goal') setShowGoal(true);
      else if (id === 'milestone') setShowCamera(true);
      else if (id === 'task') setShowTask(true);
    });
  }, [registerHandler]);

  const handleCameraClose = async (fileUrl, goal) => {
    setShowCamera(false);
    if (fileUrl && goal) {
      await base44.entities.Milestone.create({
        goal_id: goal.id,
        goal_title: goal.title,
        idol_name: goal.idol_name,
        idol_group: goal.idol_group,
        asset_url: fileUrl,
        asset_type: 'photo',
        caption: '',
      });
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      navigate('/gallery');
    }
  };

  return (
    <>
      {children}

      <NewGoalModal
        isOpen={showGoal}
        onClose={() => setShowGoal(false)}
        onSave={async (data) => {
          await base44.entities.Goal.create(data);
          queryClient.invalidateQueries({ queryKey: ['goals'] });
          setShowGoal(false);
        }}
        defaultIdol={user ? { idol_name: user.favorite_idol, idol_group: user.favorite_group } : null}
      />

      <MilestoneNativeCapture
        isOpen={showCamera}
        onClose={handleCameraClose}
        goals={goals}
      />

      <TaskModal
        isOpen={showTask}
        onClose={() => setShowTask(false)}
        onSave={async (data) => {
          await base44.entities.Task.create(data);
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
          setShowTask(false);
        }}
        goals={goals}
      />
    </>
  );
}