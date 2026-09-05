export type SessionType = 'morning' | 'midday' | 'night';

export type AffirmationCategory =
  | 'Identity & Worth'
  | 'Boundaries & Truths'
  | 'Faith & Resilience'
  | 'Self-Love & Healing'
  | 'Expectations & Attraction';

export interface Affirmation {
  id: string;
  text: string;
  category: AffirmationCategory;
  sessionTypes: SessionType[];
  active: boolean;
  displayWeight: number;
  authorNote?: string;
}

export const AFFIRMATION_CATEGORIES: AffirmationCategory[] = [
  'Identity & Worth',
  'Boundaries & Truths',
  'Faith & Resilience',
  'Self-Love & Healing',
  'Expectations & Attraction',
];

export const INITIAL_AFFIRMATIONS: Affirmation[] = [
  // MORNING MICRO-SET (Theme: Identity + Confidence)
  {
    id: 'aff-m1',
    text: 'I am fearfully and wonderfully made.',
    category: 'Identity & Worth',
    sessionTypes: ['morning'],
    active: true,
    displayWeight: 1.0,
    authorNote: 'Rooted in divine identity and sacred self-worth.',
  },
  {
    id: 'aff-m2',
    text: 'I am enough.',
    category: 'Identity & Worth',
    sessionTypes: ['morning', 'night'],
    active: true,
    displayWeight: 1.0,
    authorNote: 'Complete without needing external validation.',
  },
  {
    id: 'aff-m3',
    text: 'I am valuable.',
    category: 'Identity & Worth',
    sessionTypes: ['morning'],
    active: true,
    displayWeight: 1.0,
  },
  {
    id: 'aff-m4',
    text: 'I am unstoppable.',
    category: 'Identity & Worth',
    sessionTypes: ['morning', 'midday'],
    active: true,
    displayWeight: 1.0,
  },
  {
    id: 'aff-m5',
    text: 'I am worthy.',
    category: 'Identity & Worth',
    sessionTypes: ['morning', 'night'],
    active: true,
    displayWeight: 1.0,
  },
  {
    id: 'aff-m6',
    text: 'I can accomplish anything.',
    category: 'Identity & Worth',
    sessionTypes: ['morning'],
    active: true,
    displayWeight: 1.0,
  },
  {
    id: 'aff-m7',
    text: 'I am grateful.',
    category: 'Expectations & Attraction',
    sessionTypes: ['morning', 'night'],
    active: true,
    displayWeight: 1.0,
  },
  {
    id: 'aff-m8',
    text: 'Today will be amazing.',
    category: 'Expectations & Attraction',
    sessionTypes: ['morning'],
    active: true,
    displayWeight: 1.0,
  },

  // MIDDAY MICRO-SET (Theme: Boundaries + Truths)
  {
    id: 'aff-d1',
    text: 'My happiness depends on me.',
    category: 'Boundaries & Truths',
    sessionTypes: ['midday'],
    active: true,
    displayWeight: 1.0,
  },
  {
    id: 'aff-d2',
    text: 'No one defines my truths.',
    category: 'Boundaries & Truths',
    sessionTypes: ['midday'],
    active: true,
    displayWeight: 1.0,
  },
  {
    id: 'aff-d3',
    text: 'I date intentionally.',
    category: 'Boundaries & Truths',
    sessionTypes: ['midday'],
    active: true,
    displayWeight: 1.0,
  },
  {
    id: 'aff-d4',
    text: 'I will not settle.',
    category: 'Boundaries & Truths',
    sessionTypes: ['midday'],
    active: true,
    displayWeight: 1.0,
  },
  {
    id: 'aff-d5',
    text: 'I am the master of my truths.',
    category: 'Boundaries & Truths',
    sessionTypes: ['midday'],
    active: true,
    displayWeight: 1.0,
  },
  {
    id: 'aff-d6',
    text: 'I attract positivity today.',
    category: 'Expectations & Attraction',
    sessionTypes: ['midday', 'morning'],
    active: true,
    displayWeight: 1.0,
  },
  {
    id: 'aff-d7',
    text: "Progress isn't linear.",
    category: 'Faith & Resilience',
    sessionTypes: ['midday', 'night'],
    active: true,
    displayWeight: 1.0,
  },

  // NIGHT MICRO-SET (Theme: Healing + Release + Faith)
  {
    id: 'aff-n1',
    text: 'I forgive myself.',
    category: 'Self-Love & Healing',
    sessionTypes: ['night'],
    active: true,
    displayWeight: 1.0,
  },
  {
    id: 'aff-n2',
    text: 'My past will not define my future.',
    category: 'Self-Love & Healing',
    sessionTypes: ['night'],
    active: true,
    displayWeight: 1.0,
  },
  {
    id: 'aff-n3',
    text: 'I let go of toxicity.',
    category: 'Self-Love & Healing',
    sessionTypes: ['night', 'midday'],
    active: true,
    displayWeight: 1.0,
  },
  {
    id: 'aff-n4',
    text: 'Every challenge helps me grow.',
    category: 'Faith & Resilience',
    sessionTypes: ['night', 'midday'],
    active: true,
    displayWeight: 1.0,
  },
  {
    id: 'aff-n5',
    text: 'I trust myself.',
    category: 'Self-Love & Healing',
    sessionTypes: ['night', 'morning'],
    active: true,
    displayWeight: 1.0,
  },
  {
    id: 'aff-n6',
    text: 'Everything is working for my good.',
    category: 'Faith & Resilience',
    sessionTypes: ['night'],
    active: true,
    displayWeight: 1.0,
  },
  {
    id: 'aff-n7',
    text: 'No weapon formed against me shall prosper.',
    category: 'Faith & Resilience',
    sessionTypes: ['night', 'morning'],
    active: true,
    displayWeight: 1.0,
  },
];

export const SESSION_META: Record<
  SessionType,
  {
    title: string;
    theme: string;
    supportingCopy: string;
    icon: string;
    accentColor: string;
    optimalHours: string;
  }
> = {
  morning: {
    title: 'Morning Set',
    theme: 'Identity + Confidence',
    supportingCopy: 'Start your day from who you are — not how you feel.',
    icon: '☀️',
    accentColor: '#F59E0B',
    optimalHours: '5:00 AM – 11:59 AM',
  },
  midday: {
    title: 'Midday Set',
    theme: 'Boundaries + Truths',
    supportingCopy: "Reset. Your mood doesn't get to rewrite your truth.",
    icon: '⚡',
    accentColor: '#C2410C',
    optimalHours: '12:00 PM – 5:59 PM',
  },
  night: {
    title: 'Night Set',
    theme: 'Healing + Release + Faith',
    supportingCopy: 'Release what happened today. Keep what helped you grow.',
    icon: '🌙',
    accentColor: '#4338CA',
    optimalHours: '6:00 PM – 4:59 AM',
  },
};
