import { base44 } from '@/api/base44Client';

/**
 * Leave a goal. If the goal is linked to a mission and the user is NOT the
 * mission creator, also remove the user from the mission members.
 * Otherwise just mark the goal abandoned.
 */
export async function leaveGoal(goal, currentUserEmail) {
  if (!goal) return;
  if (goal.mission_id) {
    // Both members AND creators can leave — leaveMission handles closing the
    // mission when the creator leaves or the last member leaves.
    await base44.functions.invoke('leaveMission', {
      mission_id: goal.mission_id,
      goal_id: goal.id,
    });
    return;
  }
  await base44.entities.Goal.update(goal.id, { status: 'abandoned' });
}