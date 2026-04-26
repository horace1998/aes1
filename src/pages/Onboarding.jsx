import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ThreeBackground from '@/components/ThreeBackground';
import OnboardingWelcome from '@/components/onboarding/OnboardingWelcome';
import OnboardingIdol from '@/components/onboarding/OnboardingIdol';
import OnboardingGoal from '@/components/onboarding/OnboardingGoal';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function Onboarding() {
  const [phase, setPhase] = useState(0);
  const [idolData, setIdolData] = useState(null);

  const handleIdolSelect = (data) => {
    setIdolData(data);
    setPhase(2);
  };

  const handleGoalComplete = async (goalData) => {
    // Create the first goal
    await base44.entities.Goal.create({
      ...goalData,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      status: 'active',
      progress: 0,
      daily_checkins: [],
    });

    // Save onboarding data on user via User entity
    const me = await base44.auth.me();
    await base44.entities.User.update(me.id, {
      onboarded: true,
      favorite_idol: goalData.idol_name,
      favorite_group: goalData.idol_group,
    });

    // Navigate to dashboard
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ThreeBackground />
      <AnimatePresence mode="wait">
        {phase === 0 && <OnboardingWelcome key="welcome" onNext={() => setPhase(1)} />}
        {phase === 1 && (
          <OnboardingIdol
            key="idol"
            onNext={handleIdolSelect}
            onBack={() => setPhase(0)}
          />
        )}
        {phase === 2 && idolData && (
          <OnboardingGoal
            key="goal"
            idolData={idolData}
            onComplete={handleGoalComplete}
            onBack={() => setPhase(1)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}