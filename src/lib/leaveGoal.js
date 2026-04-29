import { base44 } from '@/api/base44Client';

/**
 * Leave a goal. If the goal is linked to a mission and the user is NOT the
 * mission creator, also remove the user from the mission members.
 * Otherwise just mark the goal abandoned.
 */
export async function leaveGoal(goal, currentUserEmail) {
  if (!goal) return;
  if (goal.mission_id) {
    // Check if user is the creator — creator should NOT be removed from their own mission
    let mission = null;
    try { mission = await base44.entities.Mission.get(goal.mission_id); } catch {}
    const isCreator = mission && mission.creator_email === currentUserEmail;

    if (!isCreator) {
      await base44.functions.invoke('leaveMission', {
        mission_id: goal.mission_id,
        goal_id: goal.id,
      });
      return;
    }
  }
  await base44.entities.Goal.update(goal.id, { status: 'abandoned' });
}