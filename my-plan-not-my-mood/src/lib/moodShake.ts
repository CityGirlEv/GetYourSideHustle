export const MOOD_SHAKE_GAME_SECONDS = 20;
export const MOOD_SHAKE_LOCK_LABEL = 'Members get the Shake-It round — a 20-second Plan vs Mood game plus a 3-move reset.';
export const MOOD_SHAKE_TIPS_LABEL = 'How to shake it';
export const MOOD_SHAKE_EXERCISE_LABEL = 'Member reset';
export const MOOD_SHAKE_GAME_LABEL = 'Plan vs Mood';
export const MOOD_SHAKE_START_LABEL = 'Start 20s round';
export const MOOD_SHAKE_UNLOCK_LABEL = 'Unlock member reset';

export type ShakeTileKind = 'plan' | 'trap';

export type ShakeTile = {
  id: string;
  label: string;
  kind: ShakeTileKind;
};

export type MoodShakeExercise = {
  title: string;
  steps: string[];
};

export type MoodShakeGame = {
  title: string;
  howTo: string;
  planMoves: string[];
  moodTraps: string[];
};

export type MoodShakePlay = {
  tips: string[];
  exercise: MoodShakeExercise;
  game: MoodShakeGame;
};

export type ShakeRoundScore = {
  planHits: number;
  trapHits: number;
  score: number;
  perfect: boolean;
};

const PLAYS: Record<string, MoodShakePlay> = {
  tired: {
    tips: [
      'Stand up and drink a full glass of water before you sit back down.',
      'Open a window or step outside for 60 seconds of daylight.',
      'Shrink the day to one 15-minute play — not the whole list.',
    ],
    exercise: {
      title: 'Wake-the-body reset',
      steps: [
        'Stand. Roll your shoulders back 10 times.',
        'Drink water. No phone in your hand.',
        'Set a 15-minute timer and start the smallest next task.',
      ],
    },
    game: {
      title: 'Energy vs Couch',
      howTo: 'Tap the PLAN moves. Skip the couch traps.',
      planMoves: ['Drink water', 'Stand up', 'One 15-min task', 'Open the blinds'],
      moodTraps: ['Hit snooze again', 'Scroll in bed', 'Wait to feel ready'],
    },
  },
  'over-it': {
    tips: [
      'Name the irritation in one sentence, then close the rant.',
      'Clear one surface — desk, sink, or inbox row.',
      'Send the one delayed message. Frustration becomes output.',
    ],
    exercise: {
      title: 'Steam-to-output circuit',
      steps: [
        'Write the rant in 2 lines. Cross it out.',
        'Clear the desk or close extra tabs.',
        'Send or schedule the one delayed action.',
      ],
    },
    game: {
      title: 'Output vs Rant',
      howTo: 'Tap the PLAN moves. Skip the spiral.',
      planMoves: ['Clear the desk', 'Send the email', 'Close extra tabs', 'One next step'],
      moodTraps: ['Vent in the group chat', 'Replay the slight', 'Quit the whole day'],
    },
  },
  procrastinating: {
    tips: [
      'Put the phone face-down in another room for 10 minutes.',
      'Start ugly: open the file, write a bad first line.',
      'A 10-minute timer beats a perfect plan you never start.',
    ],
    exercise: {
      title: 'Phone-down sprint',
      steps: [
        'Park the phone out of reach.',
        'Open the hardest task file.',
        'Work until a 10-minute timer dings. No stopping.',
      ],
    },
    game: {
      title: 'Start vs Scroll',
      howTo: 'Tap the PLAN moves. Skip the delay.',
      planMoves: ['Phone face-down', 'Open the file', '10-minute timer', 'Ugly first draft'],
      moodTraps: ['One more reel', 'Reorganize the folder', 'Wait for motivation'],
    },
  },
  anxious: {
    tips: [
      'Feel both feet on the floor. Exhale longer than you inhale, 4 times.',
      'Write 3 things you can control in the next hour.',
      'Do number one immediately — action shrinks the spiral.',
    ],
    exercise: {
      title: 'Ground-and-move drill',
      steps: [
        '4 slow breaths. Exhale longer than the inhale.',
        'List 3 controllables for the next hour.',
        'Execute #1 before you pick the phone back up.',
      ],
    },
    game: {
      title: 'Control vs Spiral',
      howTo: 'Tap the PLAN moves. Skip the what-ifs.',
      planMoves: ['Feet on the floor', 'Longer exhale', 'Write 3 controllables', 'Do number one'],
      moodTraps: ['Refresh the news', 'What-if loop', 'Ask everyone for advice'],
    },
  },
  'fired-up': {
    tips: [
      'Capture the heat: write tomorrow’s top 3 before the mood fades.',
      'Pick one play you can finish in 20 minutes and start it.',
      'Schedule the rest. Momentum without a system leaks.',
    ],
    exercise: {
      title: 'Lock-the-heat protocol',
      steps: [
        'Write tomorrow’s 3 non-negotiables.',
        'Start one 20-minute play now.',
        'Put the rest on the calendar, not in your head.',
      ],
    },
    game: {
      title: 'System vs Spark',
      howTo: 'Tap the PLAN moves. Skip burning out the spark.',
      planMoves: ['Write top 3', '20-minute play', 'Calendar the rest', 'One finish line'],
      moodTraps: ['Start 7 things', 'Skip sleep to ride it', 'Tell everyone before you start'],
    },
  },
  'motivate-me': {
    tips: [
      'Skip the pep talk. Motion first: 20 jumping jacks or a brisk walk to the mailbox.',
      'Write one non-negotiable in a notebook. Circle it.',
      'Do the first 2 minutes. Momentum shows up after you start.',
    ],
    exercise: {
      title: 'Spark-to-engine start',
      steps: [
        '20 jumping jacks or a 60-second walk.',
        'Write one non-negotiable. Circle it.',
        'Do the first 2 minutes of that play now.',
      ],
    },
    game: {
      title: 'Engine vs Pep talk',
      howTo: 'Tap the PLAN moves. Skip waiting for the feeling.',
      planMoves: ['Move for 60 seconds', 'Write one play', 'First 2 minutes', 'Circle the win'],
      moodTraps: ['Watch a hype video', 'Wait to feel it', 'Redesign the whole plan'],
    },
  },
};

export function moodShakePlay(moodId: string): MoodShakePlay | null {
  return PLAYS[String(moodId ?? '').trim()] ?? null;
}

export function shakeTipsForMood(moodId: string): string[] {
  return moodShakePlay(moodId)?.tips ?? [];
}

export function shakeExerciseForMood(moodId: string): MoodShakeExercise | null {
  return moodShakePlay(moodId)?.exercise ?? null;
}

export function shakeGameForMood(moodId: string): MoodShakeGame | null {
  return moodShakePlay(moodId)?.game ?? null;
}

export function shakeTilesForMood(moodId: string): ShakeTile[] {
  const game = shakeGameForMood(moodId);
  if (!game) return [];
  return [
    ...game.planMoves.map((label, index) => ({ id: `plan-${index}`, label, kind: 'plan' as const })),
    ...game.moodTraps.map((label, index) => ({ id: `trap-${index}`, label, kind: 'trap' as const })),
  ];
}

export function shuffleShakeTiles(tiles: ShakeTile[], random: () => number = Math.random): ShakeTile[] {
  const next = [...tiles];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const current = next[i];
    next[i] = next[j];
    next[j] = current;
  }
  return next;
}

export function scoreShakeTaps(
  taps: ShakeTileKind[],
  planCount: number,
  trapCount: number,
): ShakeRoundScore {
  const planHits = taps.filter((tap) => tap === 'plan').length;
  const trapHits = taps.filter((tap) => tap === 'trap').length;
  const cappedPlan = Math.min(planHits, Math.max(0, planCount));
  const cappedTrap = Math.min(trapHits, Math.max(0, trapCount));
  return {
    planHits: cappedPlan,
    trapHits: cappedTrap,
    score: Math.max(0, cappedPlan * 2 - cappedTrap),
    perfect: planCount > 0 && cappedPlan === planCount && cappedTrap === 0,
  };
}
