import type { TaskItem } from './workBoard';
import {
  DEFAULT_TOPIC_MINUTES,
  normalizeAgendaItem,
  type AgendaAttendee,
  type AgendaItem,
} from './sprintAgenda';
import { INCLUDED_EMAIL_TEMPLATES, INCLUDED_WEBSITE_PAGES } from './websiteScope';
import { SAVED_KICKOFF_DECISIONS } from './savedMeetings';

export const KICKOFF_AGENDA_ID = 'kickoff-agenda';
export const KICKOFF_MEETING_TITLE = 'MY PLAN, NOT MY MOOD — Kickoff Meeting';
export const KICKOFF_MEETING_TOPIC = 'Kickoff — gear sales, shirt drop, and a three-phase $10K plan';
export { KICKOFF_DATE_ISO, KICKOFF_TIME_LABEL, KICKOFF_WHEN_LABEL } from './sprintAgenda';

export const DEFAULT_KICKOFF_ATTENDEES: AgendaAttendee[] = [
  { id: 'att-angela', name: 'Angela Harris', email: 'Angela@AngelaHarris.com', role: 'Admin · Founder' },
  { id: 'att-evelyn', name: 'Evelyn Harris (Muntie Ev)', email: 'nonnegotiation@gmail.com', role: 'Super Admin · Technical Partner' },
];

export const KICKOFF_SEED_TOPICS: AgendaItem[] = [
  normalizeAgendaItem({
    id: 'kickoff-1',
    label: 'Welcome, attendees & purpose',
    minutes: 10,
    notes: 'Open the kickoff. Confirm who is in the room and why we are here.',
    actionItems: 'Confirm attendee list and meeting notes owner.',
  }),
  normalizeAgendaItem({
    id: 'kickoff-2',
    label: 'Brand origin & philosophy',
    minutes: 15,
    notes: 'The idea came through Angela’s niece. Mood gets a vote; the plan decides.',
    actionItems: 'Keep the brand line on every page and email.',
  }),
  normalizeAgendaItem({
    id: 'kickoff-3',
    label: 'Phase 1 website pages (gear launch)',
    minutes: 15,
    notes: INCLUDED_WEBSITE_PAGES.map((page) => page.name).join(', '),
    actionItems: 'Ship About, Contact, Privacy, Terms, and FAQ with the shirt site. Memberships stay Coming Soon.',
  }),
  normalizeAgendaItem({
    id: 'kickoff-4',
    label: 'Three-phase gear plan',
    minutes: 20,
    notes: 'Phase 1 is website + T-shirt design. Phase 2 is memberships. Phase 3 is future discussion.',
    actionItems: 'Price Phase 1 at $10,000. Angela pays $10K across three phase payments.',
  }),
  normalizeAgendaItem({
    id: 'kickoff-5',
    label: 'Developing Shirts',
    minutes: 15,
    notes: 'Angela wants 3 shirt styles, 1 hoodie, and 1 hat. Suggested start is 2–3 designs. Host on this site.',
    actionItems: 'Add Task List items. Angela selects the first designs. Review styles and pricing.',
  }),
  normalizeAgendaItem({
    id: 'kickoff-6',
    label: 'Testing Portal & Task List',
    minutes: 10,
    notes: 'Work is tracked on Tasks. QA lives in Testing Portal.',
    actionItems: 'Assign kickoff follow-ups on the Task List, starting with Developing Shirts.',
  }),
  normalizeAgendaItem({
    id: 'kickoff-7',
    label: 'Phase 1 email',
    minutes: 10,
    notes: `${INCLUDED_EMAIL_TEMPLATES.length} Phase 1 templates: orders, fulfillment, contact, and account mail.`,
    actionItems: 'Configure Phase 1 email. Extra templates wait for later discussion.',
  }),
  normalizeAgendaItem({
    id: 'kickoff-8',
    label: 'Decisions, owners & next steps',
    minutes: 15,
    notes: SAVED_KICKOFF_DECISIONS,
    actionItems: 'Save this meeting and link it from the Implementation Plan.',
  }),
];

export function draftKickoffFromWork(tasks: TaskItem[] = []): AgendaItem[] {
  const bySprint = new Map<string, TaskItem[]>();
  tasks.forEach((task) => {
    const key = task.sprint || 'Unscheduled';
    const list = bySprint.get(key) ?? [];
    list.push(task);
    bySprint.set(key, list);
  });

  const workTopics = ['Sprint 0', 'Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4'].flatMap((sprint, index) => {
    const rows = bySprint.get(sprint) ?? [];
    if (!rows.length) return [];
    const titles = rows.slice(0, 4).map((task) => task.title);
    return [
      normalizeAgendaItem({
        id: `kickoff-work-${index}`,
        label: `${sprint} — work on the board`,
        minutes: DEFAULT_TOPIC_MINUTES,
        notes: `${rows.length} tasks. Sample: ${titles.join('; ')}`,
        actionItems: `Review ${sprint} owners and status.`,
        custom: true,
      }),
    ];
  });

  return [
    ...KICKOFF_SEED_TOPICS,
    ...workTopics,
    normalizeAgendaItem({
      id: 'kickoff-pages',
      label: 'Page-by-page walkthrough',
      minutes: 15,
      notes: INCLUDED_WEBSITE_PAGES.map((page, index) => `${index + 1}. ${page.name}`).join('\n'),
      actionItems: 'Mark any page that needs copy from Angela.',
      custom: true,
    }),
  ];
}

export function addAgendaAttendee(
  attendees: AgendaAttendee[],
  input: { name: string; email?: string; role?: string },
): AgendaAttendee[] {
  const name = input.name.trim();
  if (!name) return attendees;
  return [
    ...attendees,
    {
      id: `att-${Date.now()}`,
      name,
      email: (input.email ?? '').trim(),
      role: (input.role ?? '').trim() || 'Attendee',
    },
  ];
}

export function removeAgendaAttendee(attendees: AgendaAttendee[], id: string): AgendaAttendee[] {
  return attendees.filter((person) => person.id !== id);
}

export function kickoffMailto(params: {
  title: string;
  topic: string;
  attendees: AgendaAttendee[];
  items: AgendaItem[];
}): string {
  const to = params.attendees.map((person) => person.email).filter(Boolean).join(',');
  const body = [
    params.title,
    params.topic,
    '',
    'Attendees:',
    ...params.attendees.map((person) => `- ${person.name}${person.role ? ` (${person.role})` : ''}`),
    '',
    'Agenda:',
    ...params.items.map((item, index) => `${index + 1}. ${item.label} (${item.minutes} min)`),
  ].join('\n');
  return `mailto:${to}?subject=${encodeURIComponent(params.title)}&body=${encodeURIComponent(body)}`;
}
