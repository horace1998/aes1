// Fan Rank system based on total check-ins + milestones
export const FAN_RANKS = [
  {
    id: 'trainee',
    label: 'Trainee',
    minScore: 0,
    color: 'from-slate-400 to-slate-500',
    textColor: 'text-slate-500',
    bgColor: 'bg-slate-100',
    emoji: '🎤',
    description: 'Just starting your journey',
  },
  {
    id: 'debut',
    label: 'Debut',
    minScore: 10,
    color: 'from-teal-400 to-emerald-500',
    textColor: 'text-teal-500',
    bgColor: 'bg-teal-50',
    emoji: '⭐',
    description: 'Finding your rhythm',
  },
  {
    id: 'rising',
    label: 'Rising Star',
    minScore: 30,
    color: 'from-blue-400 to-purple-500',
    textColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
    emoji: '🌟',
    description: 'On the rise',
  },
  {
    id: 'idol',
    label: 'Idol',
    minScore: 75,
    color: 'from-purple-500 to-pink-500',
    textColor: 'text-purple-500',
    bgColor: 'bg-purple-50',
    emoji: '💜',
    description: 'True dedication',
  },
  {
    id: 'legend',
    label: 'Legend',
    minScore: 150,
    color: 'from-yellow-400 to-orange-500',
    textColor: 'text-orange-500',
    bgColor: 'bg-orange-50',
    emoji: '👑',
    description: 'Unstoppable force',
  },
];

export function getRankScore(totalCheckins, milestoneCount) {
  return totalCheckins + milestoneCount * 5;
}

export function getFanRank(totalCheckins, milestoneCount) {
  const score = getRankScore(totalCheckins, milestoneCount);
  let rank = FAN_RANKS[0];
  for (const r of FAN_RANKS) {
    if (score >= r.minScore) rank = r;
  }
  return rank;
}

export function getNextRank(totalCheckins, milestoneCount) {
  const score = getRankScore(totalCheckins, milestoneCount);
  const idx = FAN_RANKS.findIndex(r => score < r.minScore);
  return idx !== -1 ? { rank: FAN_RANKS[idx], pointsNeeded: FAN_RANKS[idx].minScore - score } : null;
}