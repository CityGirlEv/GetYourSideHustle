import {
  KICKOFF_MEETING_ID,
  SAVED_KICKOFF_MEETING_ID,
  normalizeAgendaItem,
  type AgendaItem,
  type AgendaStateMap,
} from './sprintAgenda';

export { SAVED_KICKOFF_MEETING_ID, SAVED_KICKOFF_MEETING_TITLE, savedKickoffMeeting } from './sprintAgenda';

export const SAVED_KICKOFF_PATH = `/admin/agenda?meeting=${SAVED_KICKOFF_MEETING_ID}`;
export const SAVED_KICKOFF_LINK_LABEL = 'Open saved kickoff meeting';

export const SAVED_KICKOFF_DECISIONS = [
  'Angela has a $10,000 budget in three payments. $7,000 is received (Payments 1 and 2, including Payment 2 on Sep 18); Payment 3 is due Sprint 3.',
  'Phase 1 is the initial website rollout for T-shirt / gear sales — not the full 15-page platform.',
  'Developing Shirts is a Task List item. T-shirt design sits inside the $10K Phase 1 budget.',
  'First drop to scope: 3 shirt styles, 1 hoodie, and 1 hat. Angela selects which 2–3 designs go first.',
  'Host the drop on this site (nonnegotiation.com).',
  'Go over styles and pricing so production costs are known. Sprint ROI is modeled from organic-only posts and Angela’s 6.2K personal Facebook — no paid ads.',
  'Memberships are not configured in Phase 1. Show Coming Soon and discuss member setup in Phase 2.',
  'Anything beyond Phase 1 (mood tools, planners, Content Factory retainers) is open for future discussion as Phase 3.',
  'Sep 3 shift: sell tees from day one. Soft-sell Angela’s 6.2K Facebook now. Order her samples for the first on-body live. Socials (TikTok, YouTube, Instagram, personal pages) amplify — they do not gate sales. Every bio and live pin is https://nonnegotiation.com/gear.',
  'Each Phase 1 sprint creates 3 T-shirt sales videos. Every video includes the Shop Gear link.',
].join('\n');

export function savedKickoffAgendaItems(): AgendaItem[] {
  return [
    normalizeAgendaItem({
      id: 'saved-kickoff-welcome',
      label: 'Welcome & sprint meeting schedule',
      minutes: 10,
      notes: 'Opened the kickoff and walked the sprint meeting schedule.',
      actionItems: 'Keep this saved meeting linked from the Implementation Plan.',
    }),
    normalizeAgendaItem({
      id: 'saved-kickoff-brand',
      label: 'Brand origin & line',
      minutes: 15,
      notes: 'The idea came through Angela’s niece. Keep the brand line on the site.',
      actionItems: 'Keep: Do not let a temporary mood determine a permanent outcome.',
    }),
    normalizeAgendaItem({
      id: 'saved-kickoff-gear',
      label: 'Focus the plan on gear sales',
      minutes: 25,
      notes: SAVED_KICKOFF_DECISIONS,
      actionItems:
        'Revise the Implementation Plan to three phases. Phase 1 = shirts + launch website. Phase 2 = memberships Coming Soon. Phase 3 = future discussion.',
    }),
    normalizeAgendaItem({
      id: 'saved-kickoff-next',
      label: 'Decisions, owners & next steps',
      minutes: 15,
      notes: SAVED_KICKOFF_DECISIONS,
      actionItems:
        'Add Task List items for Developing Shirts, Angela’s design pick, styles/pricing, Orders on SnatchVault, and About / Contact / Privacy pages.',
    }),
  ];
}

export function parseAgendaMeetingParam(
  search: string,
  allowedIds: string[],
  fallback = KICKOFF_MEETING_ID,
): string {
  const raw = new URLSearchParams(search.startsWith('?') ? search : `?${search}`).get('meeting');
  const id = (raw ?? '').trim();
  if (id && allowedIds.includes(id)) return id;
  return fallback;
}

export function agendaMeetingPath(meetingId: string): string {
  return `/admin/agenda?meeting=${encodeURIComponent(meetingId)}`;
}

export function seedSavedKickoffIfMissing(state: AgendaStateMap): AgendaStateMap {
  if (state[SAVED_KICKOFF_MEETING_ID]?.length) return state;
  return { ...state, [SAVED_KICKOFF_MEETING_ID]: savedKickoffAgendaItems() };
}

export function savedKickoffPlanLink(): { id: string; label: string; href: string } {
  return {
    id: 'saved-kickoff',
    label: SAVED_KICKOFF_LINK_LABEL,
    href: SAVED_KICKOFF_PATH,
  };
}
