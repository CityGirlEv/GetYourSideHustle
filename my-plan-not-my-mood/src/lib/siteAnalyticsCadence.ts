import {
  isoDateDiffDays,
  isoDateOffsetDays,
  sprintPlacementForIso,
  SPRINT_WINDOWS,
  type SprintWindow,
} from './sprintCalendar';

/** Angela gathers the latest analytics every 3 days, starting tomorrow (not today’s already-uploaded set). */
export const SITE_ANALYTICS_CADENCE_DAYS = 3;
export const SITE_ANALYTICS_REVIEW_LAG_DAYS = 1;
export const SITE_ANALYTICS_SUBMIT_WEEKDAYS = [1, 3, 5] as const;
export const SITE_ANALYTICS_WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const SITE_ANALYTICS_FIRST_SPRINT_INDEX = 1;
export const SITE_ANALYTICS_TASK_START_NUMBER = 83;
export const SITE_ANALYTICS_TASK_HREF = '/admin/factory';

/** Today’s upload is already done. Forward schedule starts tomorrow. */
export const SITE_ANALYTICS_TODAY_ISO = '2026-09-17';
export const SITE_ANALYTICS_ANGELA_START_ISO = isoDateOffsetDays(SITE_ANALYTICS_TODAY_ISO, 1);
export const SITE_ANALYTICS_REVIEW_START_ISO = isoDateOffsetDays(
  SITE_ANALYTICS_ANGELA_START_ISO,
  SITE_ANALYTICS_REVIEW_LAG_DAYS,
);
export const SITE_ANALYTICS_CATCHUP_TODAY_ISO = SITE_ANALYTICS_TODAY_ISO;
export const SITE_ANALYTICS_CATCHUP_START_ISO = SITE_ANALYTICS_ANGELA_START_ISO;
export const SITE_ANALYTICS_CATCHUP_SPRINT = 'Sprint 2' as const;

export type SiteAnalyticsPlatformId = 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'personal';

export type SiteAnalyticsPlatform = {
  id: SiteAnalyticsPlatformId;
  label: string;
  app: string;
  screens: string[];
};

/** Screens Angela captures on each posting platform. One gather task per platform. */
export const SITE_ANALYTICS_PLATFORMS: readonly SiteAnalyticsPlatform[] = [
  {
    id: 'facebook',
    label: 'Facebook',
    app: 'Facebook Professional Dashboard / Page Insights',
    screens: [
      'Overview (latest current window — not today’s already-uploaded screenshots)',
      'Reach',
      'Content — top posts and Reels',
      'Followers',
      'Link clicks / shop traffic',
      'NonNegotiation Page Insights for this window',
    ],
  },
  {
    id: 'instagram',
    label: 'Instagram',
    app: 'Instagram Insights',
    screens: [
      'Insights overview (latest current window — not today’s already-uploaded screenshots)',
      'Accounts reached',
      'Content interactions',
      'Profile activity — profile visits and website taps',
      'Followers',
      'Reels / Stories posted in this window',
      'NonNegotiation Instagram Insights',
    ],
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    app: 'TikTok Analytics',
    screens: [
      'Analytics overview (last 7 days is fine if 2-day is not offered)',
      'Video views',
      'Followers',
      'Profile views',
      'Traffic — For You vs Following vs Search',
      'Top videos in this window',
    ],
  },
  {
    id: 'youtube',
    label: 'YouTube',
    app: 'YouTube Studio Analytics',
    screens: [
      'Analytics overview',
      'Reach',
      'Engagement',
      'Audience',
      'Latest video(s) in this window',
      'Traffic sources',
      'Subscribers',
    ],
  },
  {
    id: 'personal',
    label: 'Personal',
    app: 'Personal Facebook and Instagram Insights',
    screens: [
      'Personal Facebook Insights overview',
      'Personal Facebook reach / engagement',
      'Personal Instagram Insights overview',
      'Personal Instagram reach / interactions',
      'Shop-link clicks if the app shows them',
    ],
  },
];

export const SITE_ANALYTICS_CHANNELS = SITE_ANALYTICS_PLATFORMS.map((platform) => platform.label);

export const SITE_ANALYTICS_SPRINT_DELIVERABLE =
  'Every 3 days: Angela uploads the latest analytics screens on each posting platform; Evelyn reviews the next day and that review guides the next create';

export const SITE_ANALYTICS_ANGELA_TASK =
  'Gather the latest analytics screens for each posting platform — starting tomorrow, then every 3 days';

export const SITE_ANALYTICS_EVELYN_TASK =
  'Review each platform upload, make recommendations, and use them as the guide for the next create';

export type SiteAnalyticsSprintLabel = 'Sprint 1' | 'Sprint 2' | 'Sprint 3' | 'Sprint 4';
export type SiteAnalyticsRole = 'angela' | 'evelyn';
export type SiteAnalyticsWeekday = (typeof SITE_ANALYTICS_WEEKDAY_NAMES)[number];

export type SiteAnalyticsInstance = {
  id: string;
  role: SiteAnalyticsRole;
  platformId: SiteAnalyticsPlatformId;
  platformLabel: string;
  screens: string[];
  sprintLabel: SiteAnalyticsSprintLabel;
  dueIso: string;
  weekday: SiteAnalyticsWeekday;
  title: string;
  groupId: string;
};

export type SiteAnalyticsSeedTask = {
  id: string;
  title: string;
  sprint: SiteAnalyticsSprintLabel;
  phase: 'Phase 1';
  category: 'Content';
  priority: 'high';
  status: 'not_started';
  assignee: SiteAnalyticsRole;
  assignor: SiteAnalyticsRole;
  dueDate: string;
  groupId: string;
};

function weekdayNumberFromIso(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).getDay();
}

function formatDueLabel(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function nextSiteAnalyticsDueIso(
  lastProvidedIso: string,
  cadenceDays = SITE_ANALYTICS_CADENCE_DAYS,
): string {
  return isoDateOffsetDays(lastProvidedIso, cadenceDays);
}

export function siteAnalyticsIsDue(
  lastProvidedIso: string | undefined,
  todayIso: string,
  cadenceDays = SITE_ANALYTICS_CADENCE_DAYS,
): boolean {
  if (!lastProvidedIso) return true;
  return isoDateDiffDays(lastProvidedIso, todayIso) >= cadenceDays;
}

export function siteAnalyticsGuidesNextCreate(input: {
  hasRecommendations: boolean;
  usedForNextCreate: boolean;
}): boolean {
  return input.hasRecommendations === true && input.usedForNextCreate === true;
}

export function isSiteAnalyticsSubmitWeekday(iso: string): boolean {
  return (SITE_ANALYTICS_SUBMIT_WEEKDAYS as readonly number[]).includes(weekdayNumberFromIso(iso));
}

export function siteAnalyticsDueIsosForWindow(startIso: string, endIso: string): string[] {
  const dates: string[] = [];
  let cursor = startIso;
  while (isoDateDiffDays(cursor, endIso) >= 0) {
    if (isSiteAnalyticsSubmitWeekday(cursor)) dates.push(cursor);
    cursor = isoDateOffsetDays(cursor, 1);
  }
  return dates;
}

export function siteAnalyticsPlatformById(id: string): SiteAnalyticsPlatform | undefined {
  return SITE_ANALYTICS_PLATFORMS.find((platform) => platform.id === id);
}

export function screensForPlatform(id: SiteAnalyticsPlatformId): string[] {
  return [...(siteAnalyticsPlatformById(id)?.screens ?? [])];
}

function analyticsWindows(): SprintWindow[] {
  return SPRINT_WINDOWS.filter((window, index) => index >= SITE_ANALYTICS_FIRST_SPRINT_INDEX);
}

function analyticsSprintForDueIso(dueIso: string): SiteAnalyticsSprintLabel {
  const label = sprintPlacementForIso(dueIso).label;
  if (label === 'Sprint 3' || label === 'Sprint 4') return label;
  return 'Sprint 2';
}

export function originalAnalyticsDueIsoFromGroupId(groupId: string): string {
  const match = /^analytics-(\d{4}-\d{2}-\d{2})-/.exec(groupId);
  return match?.[1] ?? '';
}

export function dueDateForAngelaAnalyticsSlot(slotIndex: number): string {
  return isoDateOffsetDays(SITE_ANALYTICS_ANGELA_START_ISO, Math.max(0, slotIndex) * SITE_ANALYTICS_CADENCE_DAYS);
}

export function dueDateForEvelynAnalyticsReview(angelaDueIso: string): string {
  return isoDateOffsetDays(angelaDueIso, SITE_ANALYTICS_REVIEW_LAG_DAYS);
}

function retitleAnalyticsInstance(
  instance: SiteAnalyticsInstance,
  dueIso: string,
  sprintLabel: SiteAnalyticsSprintLabel,
): SiteAnalyticsInstance {
  const weekday = SITE_ANALYTICS_WEEKDAY_NAMES[weekdayNumberFromIso(dueIso)] as SiteAnalyticsWeekday;
  const label = formatDueLabel(dueIso);
  const title =
    instance.role === 'angela'
      ? `Gather ${instance.platformLabel} analytics — ${label} (${sprintLabel})`
      : `Review ${instance.platformLabel} analytics & guide next create — ${label} (${sprintLabel})`;
  return { ...instance, dueIso, weekday, sprintLabel, title };
}

/** Angela’s uploads start tomorrow and repeat every 3 days; matching reviews are due the next day. */
export function applySiteAnalyticsForwardSchedule(instances: SiteAnalyticsInstance[]): SiteAnalyticsInstance[] {
  const originalDates = [
    ...new Set(
      instances
        .filter((instance) => instance.role === 'angela')
        .map((instance) => originalAnalyticsDueIsoFromGroupId(instance.groupId) || instance.dueIso),
    ),
  ];
  const angelaDueByOriginal = new Map(
    originalDates.map((iso, slot) => [iso, dueDateForAngelaAnalyticsSlot(slot)] as const),
  );
  return instances.map((instance) => {
    const original = originalAnalyticsDueIsoFromGroupId(instance.groupId) || instance.dueIso;
    const angelaDue = angelaDueByOriginal.get(original);
    if (!angelaDue) return instance;
    const dueIso = instance.role === 'angela' ? angelaDue : dueDateForEvelynAnalyticsReview(angelaDue);
    return retitleAnalyticsInstance(instance, dueIso, analyticsSprintForDueIso(dueIso));
  });
}

/** @deprecated Use applySiteAnalyticsForwardSchedule. */
export function applyAngelaAnalyticsCatchUp(instances: SiteAnalyticsInstance[]): SiteAnalyticsInstance[] {
  return applySiteAnalyticsForwardSchedule(instances);
}

export function buildSiteAnalyticsInstances(
  startNumber = SITE_ANALYTICS_TASK_START_NUMBER,
): SiteAnalyticsInstance[] {
  const instances: SiteAnalyticsInstance[] = [];
  let number = startNumber;

  for (const window of analyticsWindows()) {
    const sprintLabel = window.label as SiteAnalyticsSprintLabel;
    for (const dueIso of siteAnalyticsDueIsosForWindow(window.startIso, window.endIso)) {
      const weekday = SITE_ANALYTICS_WEEKDAY_NAMES[weekdayNumberFromIso(dueIso)] as SiteAnalyticsWeekday;
      const label = formatDueLabel(dueIso);
      for (const platform of SITE_ANALYTICS_PLATFORMS) {
        const groupId = `analytics-${dueIso}-${platform.id}`;
        instances.push({
          id: `t-${number}`,
          role: 'angela',
          platformId: platform.id,
          platformLabel: platform.label,
          screens: [...platform.screens],
          sprintLabel,
          dueIso,
          weekday,
          groupId,
          title: `Gather ${platform.label} analytics — ${label} (${sprintLabel})`,
        });
        number += 1;
        instances.push({
          id: `t-${number}`,
          role: 'evelyn',
          platformId: platform.id,
          platformLabel: platform.label,
          screens: [...platform.screens],
          sprintLabel,
          dueIso,
          weekday,
          groupId,
          title: `Review ${platform.label} analytics & guide next create — ${label} (${sprintLabel})`,
        });
        number += 1;
      }
    }
  }

  return applySiteAnalyticsForwardSchedule(instances);
}

export function buildSiteAnalyticsSeedTasks(
  startNumber = SITE_ANALYTICS_TASK_START_NUMBER,
): SiteAnalyticsSeedTask[] {
  return buildSiteAnalyticsInstances(startNumber).map((instance) => ({
    id: instance.id,
    title: instance.title,
    sprint: instance.sprintLabel,
    phase: 'Phase 1',
    category: 'Content',
    priority: 'high',
    status: 'not_started',
    assignee: instance.role,
    assignor: instance.role === 'angela' ? 'evelyn' : 'angela',
    dueDate: instance.dueIso,
    groupId: instance.groupId,
  }));
}

const SITE_ANALYTICS_BY_ID = new Map(buildSiteAnalyticsInstances().map((instance) => [instance.id, instance]));

export function siteAnalyticsTaskById(id: string): SiteAnalyticsInstance | undefined {
  return SITE_ANALYTICS_BY_ID.get(String(id || '').split('::')[0]);
}

export function siteAnalyticsContentSeed(id: string): {
  description: string;
  steps: Array<string | { label: string; href?: string }>;
} | undefined {
  const instance = siteAnalyticsTaskById(id);
  if (!instance) return undefined;
  const platform = siteAnalyticsPlatformById(instance.platformId);
  if (instance.role === 'angela') {
    return {
      description: `Gather the latest ${instance.platformLabel} analytics in ${platform?.app ?? instance.platformLabel} as of this due date. Capture each listed screen and upload those screenshots on this task. Do not re-upload screenshots from a previous day (including today’s already-uploaded set), and do not reuse another platform’s task.`,
      steps: [
        { label: `Open ${platform?.app ?? instance.platformLabel}`, href: SITE_ANALYTICS_TASK_HREF },
        ...instance.screens.map((screen) => `Capture: ${screen}`),
        'Upload the latest screenshots on this task — not today’s already-uploaded set',
      ],
    };
  }
  return {
      description: `Review Angela’s latest ${instance.platformLabel} upload (due the day before this review), write recommendations, and use them as the guide for the next ${instance.platformLabel} create. Do not start that create without this review.`,
    steps: [
      { label: 'Open this review task', href: SITE_ANALYTICS_TASK_HREF },
      `Open Angela’s ${instance.platformLabel} gather task (${instance.groupId}) and confirm every listed screen is uploaded`,
      'Write recommendations (keep, cut, or try next)',
      `Use those recommendations as the guide for the next ${instance.platformLabel} create`,
    ],
  };
}
