export interface MoodOption {
  id: string;
  label: string;
  emoji: string;
  responseTitle: string;
  brandResponse: string;
  actionStep: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  {
    id: 'tired',
    label: 'TIRED',
    emoji: '😴',
    responseTitle: 'Fatigue is real. The plan doesn\'t sleep.',
    brandResponse: 'Your body wants the couch, but your future self needs this win. We don\'t need 100% speed today—we just need execution.',
    actionStep: 'Drink 16oz of water right now and complete ONE 15-minute priority task.',
  },
  {
    id: 'over-it',
    label: 'OVER IT',
    emoji: '😤',
    responseTitle: 'Channel that frustration into output.',
    brandResponse: 'Irritation means you care about standards. Don\'t waste that energy complaining—use it as fuel to get things done.',
    actionStep: 'Clear your desk surface completely and send the single email you have been delaying.',
  },
  {
    id: 'procrastinating',
    label: 'PROCRASTINATING',
    emoji: '📱',
    responseTitle: 'Doomscrolling won\'t fix your to-do list.',
    brandResponse: 'The mood wants distraction to avoid temporary discomfort. Put down the phone. The plan is waiting for you.',
    actionStep: 'Set a 10-minute timer. Work on your hardest task until the timer dings. No stopping.',
  },
  {
    id: 'anxious',
    label: 'ANXIOUS',
    emoji: '😰',
    responseTitle: 'Action cures anxiety.',
    brandResponse: 'Anxiety thrives on uncertainty and overthinking. Small, tangible action strips anxiety of its control.',
    actionStep: 'Write down 3 things you can control in the next hour. Execute number one immediately.',
  },
  {
    id: 'fired-up',
    label: 'FIRED UP',
    emoji: '🔥',
    responseTitle: 'Lock it in with a system before the mood fades.',
    brandResponse: 'High energy is a gift, but motivation is temporary. Harness today\'s momentum by building a plan for tomorrow.',
    actionStep: 'Draft your top 3 non-negotiable plays for tomorrow before you go to sleep tonight.',
  },
  {
    id: 'motivate-me',
    label: 'MOTIVATE ME!',
    emoji: '🚀',
    responseTitle: 'Ignite the fire. The plan provides unstoppable momentum.',
    brandResponse: 'Motivation is the spark, but your plan is the engine. When you take the first action step, momentum will take care of the rest.',
    actionStep: 'Pick up your planner right now, write down your top 3 non-negotiables, and execute step one immediately.',
  },
];
