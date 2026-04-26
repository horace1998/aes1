/**
 * PageShell — wraps a page with BottomNav + FAB modals (NewGoal, Camera, Task)
 * Usage: <PageShell goals={goals} user={user}>{content}</PageShell>
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import NewGoalModal from '@/components/dashboard/NewGoalModal';
import TaskModal from '@/components/TaskModal';
import MilestoneCamera from '@/components/MilestoneCamera';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function PageShell({ children, goals = [], user }) {
  const [showGoal, setShowGoal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showTask, setShowTask] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleSelect = (id) => {
    if (id === 'goal') setShowGoal(true);
    else if (id === 'milestone') setShowCamera(true);
    else if (id === 'task') setShowTask(true);
  };

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
      <BottomNav onSelect={handleSelect} />

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

      <MilestoneCamera
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