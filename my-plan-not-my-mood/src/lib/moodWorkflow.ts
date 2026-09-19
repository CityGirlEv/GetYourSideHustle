import { MOOD_OPTIONS, type MoodOption } from '../data/moods';
import { moodShakePlay } from './moodShake';
import type { SiteTreeNode } from './siteMap';
import { TODAYS_NEW_TEST_PARENT_DUE, TODAYS_NEW_TEST_SPRINT, dueDateForTodaysNewTest } from './todaysReviewDueDates';

export const MOOD_WORKFLOW_TASK_ID = 't-206';
export const MOOD_WORKFLOW_SPRINT = TODAYS_NEW_TEST_SPRINT;
export const MOOD_WORKFLOW_ASSIGNEE = 'angela' as const;
export const MOOD_BUBBLES_TEST_ID = 'mood-bubbles-review';
export const MOOD_WORKFLOW_MAP_TEST_ID = 'mood-workflow-map';
export const MOOD_AREA_HREF = '/#mood-tool';
export const MOOD_HERO_BUBBLES_HREF = '/#mood-hero-bubbles';
export const MOOD_WORKFLOW_MAP_HREF = '/sitemap#mood-workflow';
export const MOOD_HOW_IT_WORKS_HREF = '/#mood-how-it-works';

export type MoodWorkflowStep = {
  n: number;
  label: string;
  href: string;
  detail: string;
};

/** Explicit map of how mood bubbles open the mood area and suggestions. */
export const MOOD_WORKFLOW_STEPS: MoodWorkflowStep[] = [
  {
    n: 1,
    label: 'Go to Home page — What’s Your Mood tool',
    href: MOOD_AREA_HREF,
    detail:
      'Home is the only public entry. Header “What’s Your Mood?” and the Mood Matrix section both land on #mood-tool.',
  },
  {
    n: 2,
    label: 'Go to Home page — hero mood bubbles',
    href: MOOD_HERO_BUBBLES_HREF,
    detail:
      'The Mood Matrix on Home lists every mood bubble (emoji + label). Clicking a bubble selects that mood and opens the shake-it card in #mood-tool.',
  },
  {
    n: 3,
    label: 'Go to Home page — mood area buttons',
    href: MOOD_AREA_HREF,
    detail:
      'The mood area repeats the same six buttons. You can pick a mood here without using the hero list. Selected state is ACTIVE / highlighted.',
  },
  {
    n: 4,
    label: 'Go to Home page — shake-it suggestions',
    href: MOOD_AREA_HREF,
    detail:
      'A suggestion card opens: Mood detected, How to shake it tips, the brand response, and Today’s single play. Reset closes the card.',
  },
  {
    n: 5,
    label: 'Go to Home page — member reset lock',
    href: MOOD_AREA_HREF,
    detail:
      'Guests see Unlock member reset (Join). Members see a 3-move reset plus a 20-second Plan vs Mood game. Suggestions never sell a shirt.',
  },
];

export function moodButtonCatalog(): MoodOption[] {
  return MOOD_OPTIONS;
}

export function moodButtonLabels(): string[] {
  return MOOD_OPTIONS.map((mood) => mood.label);
}

export function moodWorkflowTreeNodes(): SiteTreeNode[] {
  return [
    {
      id: 'mood-hero-bubbles',
      label: 'Hero mood bubbles',
      path: MOOD_HERO_BUBBLES_HREF,
      status: 'live',
      branch: 'tools',
      weight: 2,
    },
    {
      id: 'mood-workflow',
      label: 'Mood workflow map',
      path: MOOD_WORKFLOW_MAP_HREF,
      status: 'live',
      branch: 'tools',
      weight: 2,
    },
  ];
}

function moodReviewSteps(mood: MoodOption): Array<string | { label: string; href?: string }> {
  const play = moodShakePlay(mood.id);
  const tips = play?.tips ?? [];
  return [
    {
      label: `Go to Home page — ${mood.emoji} ${mood.label} bubble`,
      href: `${MOOD_AREA_HREF}`,
    },
    `On the hero list (#mood-hero-bubbles), click ${mood.emoji} ${mood.label}. Confirm Home scrolls to the mood area and ${mood.label} is selected (ACTIVE).`,
    `On the mood area buttons, confirm the matching button shows ${mood.emoji} and the label ${mood.label}.`,
    `Confirm the suggestion card heading is: ${mood.responseTitle}`,
    `Confirm the brand response is: ${mood.brandResponse}`,
    `Confirm Today’s single play is: ${mood.actionStep}`,
    ...tips.map((tip, index) => `Confirm How to shake it tip ${index + 1}: ${tip}`),
    `Confirm the guest lock (Unlock member reset) is present unless you are signed in as a member. Member-only game copy for this mood is “${play?.game.title ?? 'Plan vs Mood'}”.`,
    'Tap Reset. Confirm the suggestion card closes so the next mood can be selected.',
  ];
}

export function buildMoodBubblesReviewSteps(): Array<string | { label: string; href?: string }> {
  return [
    { label: 'Go to Home page — What’s Your Mood tool', href: MOOD_AREA_HREF },
    `Confirm the hero bubbles and the mood-area buttons list exactly these moods in this order: ${moodButtonLabels().join(', ')}.`,
    'Confirm each bubble is at least 44×44 and the label matches the emoji on both the hero list and the mood area.',
    ...MOOD_OPTIONS.flatMap((mood) => moodReviewSteps(mood)),
    'On a phone-width (~320px), confirm no horizontal scroll and every mood button stays tappable.',
  ];
}

export function buildMoodWorkflowMapSteps(): Array<string | { label: string; href?: string }> {
  return [
    { label: 'Go to Site Map page — Mood workflow map', href: MOOD_WORKFLOW_MAP_HREF },
    'Read the How What’s Your Mood works map. Confirm it names Home, hero bubbles, mood area, suggestions, Reset, and the member lock.',
    ...MOOD_WORKFLOW_STEPS.map(
      (step) =>
        `On the map, confirm step ${step.n}: ${step.label}. Follow the deep link and confirm the landing item matches the copy.`,
    ),
    { label: 'Go to Home page — How this tool works', href: MOOD_HOW_IT_WORKS_HREF },
    'Walk the five workflow steps on Home against the Site Map explanation. Flag any step the live tool does not match.',
    { label: 'Go to Home page — hero mood bubbles', href: MOOD_HERO_BUBBLES_HREF },
    'Click one bubble, confirm scroll to #mood-tool, then Reset. Repeat from a mood-area button. Confirm both paths open the same suggestion card.',
  ];
}

export type MoodWorkflowQaSeed = {
  id: string;
  title: string;
  desc: string;
  sprint: typeof MOOD_WORKFLOW_SPRINT;
  phase: 'Phase 1';
  category: 'Storefront QA';
  priority: 'high';
  status: 'untested';
  assignee: typeof MOOD_WORKFLOW_ASSIGNEE;
  assignor: 'evelyn';
  dueDate: string;
};

export type MoodWorkflowContentSeed = {
  description: string;
  steps: Array<string | { label: string; href?: string }>;
};

export function moodWorkflowSpecs(): Array<{
  id: string;
  title: string;
  path: string;
  desc: string;
  steps: Array<string | { label: string; href?: string }>;
}> {
  return [
    {
      id: MOOD_BUBBLES_TEST_ID,
      title: 'What’s Your Mood — every bubble, button copy, and suggestion',
      path: MOOD_AREA_HREF,
      desc: 'Angela reviews every mood bubble (hero + mood area): labels, emojis, brand copy, Today’s single play, and How to shake it tips. Then Reset and the next mood.',
      steps: buildMoodBubblesReviewSteps(),
    },
    {
      id: MOOD_WORKFLOW_MAP_TEST_ID,
      title: 'What’s Your Mood — workflow map on Site Map and Home',
      path: MOOD_WORKFLOW_MAP_HREF,
      desc: 'Angela reads the Mood workflow map on Site Map, follows each deep link, and confirms the live Home tool matches the explained path: bubble → mood area → suggestions → Reset / member lock.',
      steps: buildMoodWorkflowMapSteps(),
    },
  ];
}

export function moodWorkflowTestIds(): string[] {
  return moodWorkflowSpecs().map((spec) => spec.id);
}

export function moodWorkflowTestCount(): number {
  return moodWorkflowSpecs().length;
}

export function moodWorkflowTaskTitle(count = moodWorkflowTestCount()): string {
  return `What’s Your Mood — bubbles, suggestions, and workflow (${count} tests)`;
}

export function buildMoodWorkflowQaSeeds(): MoodWorkflowQaSeed[] {
  return moodWorkflowSpecs().map((spec, index) => ({
    id: spec.id,
    title: spec.title,
    desc: spec.desc,
    sprint: MOOD_WORKFLOW_SPRINT,
    phase: 'Phase 1',
    category: 'Storefront QA',
    priority: 'high',
    status: 'untested',
    assignee: MOOD_WORKFLOW_ASSIGNEE,
    assignor: 'evelyn',
    dueDate: dueDateForTodaysNewTest(index),
  }));
}

export function buildMoodWorkflowTask(): {
  id: string;
  title: string;
  sprint: typeof MOOD_WORKFLOW_SPRINT;
  phase: 'Phase 1';
  category: 'QA & Testing';
  priority: 'high';
  status: 'not_started';
  assignee: typeof MOOD_WORKFLOW_ASSIGNEE;
  assignor: 'evelyn';
  dueDate: string;
} {
  return {
    id: MOOD_WORKFLOW_TASK_ID,
    title: moodWorkflowTaskTitle(),
    sprint: MOOD_WORKFLOW_SPRINT,
    phase: 'Phase 1',
    category: 'QA & Testing',
    priority: 'high',
    status: 'not_started',
    assignee: MOOD_WORKFLOW_ASSIGNEE,
    assignor: 'evelyn',
    dueDate: TODAYS_NEW_TEST_PARENT_DUE,
  };
}

export function moodWorkflowTaskContent(): MoodWorkflowContentSeed {
  const count = moodWorkflowTestCount();
  return {
    description: `Angela reviews every What’s Your Mood bubble, the suggestion card for each mood, and the workflow map on Site Map + Home. ${count} tests are attached.`,
    steps: [
      { label: 'Go to Home page — What’s Your Mood tool', href: MOOD_AREA_HREF },
      { label: 'Go to Site Map page — Mood workflow map', href: MOOD_WORKFLOW_MAP_HREF },
      `Open Testing Portal and work the ${count} linked mood tests on this task`,
    ],
  };
}

export function moodWorkflowPageHrefs(): Record<string, string> {
  return {
    [MOOD_WORKFLOW_TASK_ID]: MOOD_AREA_HREF,
    ...Object.fromEntries(moodWorkflowSpecs().map((spec) => [spec.id, spec.path])),
  };
}

export function moodWorkflowQaContent(): Record<string, MoodWorkflowContentSeed> {
  return Object.fromEntries(
    moodWorkflowSpecs().map((spec) => [spec.id, { description: spec.desc, steps: spec.steps }]),
  );
}
