/**
 * Sprint 3 journal/planner make + review pairs.
 * Evelyn drafts each journal on day 2 of the next sprint; Angela reviews 2 days later.
 * Each review has a linked proofread test.
 */

import { isoDateOffsetDays, sprintWindowByLabel } from './sprintCalendar';

/** Next sprint after current Sprint 2 (Mon Sep 14 – Sun Sep 20). */
export const JOURNAL_MAKE_REVIEW_SPRINT = 'Sprint 3' as const;
export const JOURNAL_MAKE_ASSIGNEE = 'evelyn' as const;
export const JOURNAL_REVIEW_ASSIGNEE = 'angela' as const;
export const JOURNAL_PLANNERS_HREF = '/planners';
export const JOURNAL_ASSET_LIBRARY_HREF = '/admin/asset-library';

const COPY_A_TO_Z_CHECK =
  'Read every heading, product name, description, and interior sample A to Z. Check wording, grammar, and punctuation. Flag typos, missing words, placeholder copy, DEMO DATA that should not ship, and broken or missing images';
const MOBILE_LAYOUT_CHECK =
  'On a phone-width (~320px), confirm no horizontal scroll and primary taps are at least 44×44';

/** Day 1 = sprint start Monday; day 2 = Tuesday. */
export function dueOnDayOfSprint(sprintLabel: string, dayNumber: number): string {
  const window = sprintWindowByLabel(sprintLabel);
  if (!window) return '';
  return isoDateOffsetDays(window.startIso, Math.max(1, dayNumber) - 1);
}

export const JOURNAL_EVELYN_DUE = dueOnDayOfSprint(JOURNAL_MAKE_REVIEW_SPRINT, 2);
export const JOURNAL_ANGELA_DUE = isoDateOffsetDays(JOURNAL_EVELYN_DUE, 2);

export type JournalMakeReviewItem = {
  slug: string;
  makeTaskId: string;
  reviewTaskId: string;
  testId: string;
  productName: string;
  accessoryLabel: string;
  interiors: string;
};

export const JOURNAL_MAKE_REVIEW_ITEMS: JournalMakeReviewItem[] = [
  {
    slug: '90day',
    makeTaskId: 't-211',
    reviewTaskId: 't-208',
    testId: 'journal-90day',
    productName: '90-Day Follow-Through Goal Journal',
    accessoryLabel: 'Journal',
    interiors: 'goal dissection worksheets, weekly review prompts, and daily execution pages',
  },
  {
    slug: 'deskpad',
    makeTaskId: 't-209',
    reviewTaskId: 't-210',
    testId: 'journal-deskpad',
    productName: 'What’s The Plan Daily Execution Desk Pad',
    accessoryLabel: 'Planner',
    interiors: 'top 3 non-negotiables, mood-trap warnings, and daily What Won Today? receipt check',
  },
];

export type JournalMakeReviewContentSeed = {
  description: string;
  steps: Array<string | { label: string; href?: string }>;
};

export type JournalMakeReviewTaskSeed = {
  id: string;
  title: string;
  sprint: typeof JOURNAL_MAKE_REVIEW_SPRINT;
  phase: 'Phase 2';
  category: 'Content' | 'QA & Testing';
  priority: 'high';
  status: 'not_started';
  assignee: typeof JOURNAL_MAKE_ASSIGNEE | typeof JOURNAL_REVIEW_ASSIGNEE;
  assignor: 'evelyn';
  dueDate: string;
};

export type JournalMakeReviewQaSeed = {
  id: string;
  title: string;
  desc: string;
  sprint: typeof JOURNAL_MAKE_REVIEW_SPRINT;
  phase: 'Phase 2';
  category: 'Content QA';
  priority: 'high';
  status: 'untested';
  assignee: typeof JOURNAL_REVIEW_ASSIGNEE;
  assignor: 'evelyn';
  dueDate: string;
};

export function journalMakeReviewTaskIds(): string[] {
  return JOURNAL_MAKE_REVIEW_ITEMS.flatMap((item) => [item.makeTaskId, item.reviewTaskId]);
}

export function journalMakeReviewTestIds(): string[] {
  return JOURNAL_MAKE_REVIEW_ITEMS.map((item) => item.testId);
}

export function isJournalMakeReviewTaskId(id: string): boolean {
  const root = String(id || '').split('::')[0];
  return journalMakeReviewTaskIds().includes(root);
}

export function isJournalMakeReviewTestId(id: string): boolean {
  return /^journal-/.test(String(id || ''));
}

function goToPlannersStep(suffix: string): { label: string; href: string } {
  return {
    label: `Go to Planners page — ${suffix}`,
    href: JOURNAL_PLANNERS_HREF,
  };
}

function makeTaskContent(item: JournalMakeReviewItem): JournalMakeReviewContentSeed {
  return {
    description: `Draft and place the ${item.productName} (Phase 2 ${item.accessoryLabel}) on Planners: interiors, product name, description, and mockup. Due day 2 of ${JOURNAL_MAKE_REVIEW_SPRINT}. Angela reviews two days later.`,
    steps: [
      goToPlannersStep(item.productName),
      `Write the interiors: ${item.interiors}. Brand voice stays My Plan, Not My Mood — no PII, no DEMO DATA in ship copy`,
      { label: 'Go to Asset Library page — Accessories tab for this journal', href: JOURNAL_ASSET_LIBRARY_HREF },
      `Put the product name, description, mockup, and interior samples on the Planners listing for ${item.productName}`,
      'Notify Angela that the journal is ready for her review and proofread test',
    ],
  };
}

function reviewTaskContent(item: JournalMakeReviewItem): JournalMakeReviewContentSeed {
  return {
    description: `Review the ${item.productName} Evelyn made: interiors, listing copy, and mockup. Proofread wording, grammar, and punctuation A to Z. Due two days after Evelyn’s make task.`,
    steps: [
      goToPlannersStep(item.productName),
      COPY_A_TO_Z_CHECK,
      `Confirm interiors cover ${item.interiors}`,
      `Confirm the Phase 2 ${item.accessoryLabel} name matches My Plan, Not My Mood ${item.accessoryLabel}`,
      MOBILE_LAYOUT_CHECK,
      `Open Testing Portal and pass the linked ${item.productName} proofread test`,
    ],
  };
}

function reviewTestSpec(item: JournalMakeReviewItem): JournalMakeReviewContentSeed & {
  id: string;
  title: string;
  path: string;
  desc: string;
} {
  return {
    id: item.testId,
    title: `${item.productName} — proofread and review`,
    path: JOURNAL_PLANNERS_HREF,
    desc: `Angela proofreads the ${item.productName} listing and interiors A to Z: wording, grammar, punctuation, mockup, and workflow from Planners.`,
    description: `Angela proofreads the ${item.productName} listing and interiors A to Z: wording, grammar, punctuation, mockup, and workflow from Planners.`,
    steps: [
      goToPlannersStep(item.productName),
      `Find ${item.productName} on Planners and open the listing`,
      COPY_A_TO_Z_CHECK,
      `Confirm interiors describe ${item.interiors} and match the mockup`,
      `Confirm the brand line is My Plan, Not My Mood ${item.accessoryLabel} — no placeholder or DEMO DATA copy`,
      MOBILE_LAYOUT_CHECK,
    ],
  };
}

export function journalMakeReviewQaSpecs() {
  return JOURNAL_MAKE_REVIEW_ITEMS.map((item) => reviewTestSpec(item));
}

export function buildJournalMakeReviewTasks(): JournalMakeReviewTaskSeed[] {
  return JOURNAL_MAKE_REVIEW_ITEMS.flatMap((item) => [
    {
      id: item.makeTaskId,
      title: `Make the ${item.productName}`,
      sprint: JOURNAL_MAKE_REVIEW_SPRINT,
      phase: 'Phase 2',
      category: 'Content',
      priority: 'high',
      status: 'not_started',
      assignee: JOURNAL_MAKE_ASSIGNEE,
      assignor: 'evelyn',
      dueDate: JOURNAL_EVELYN_DUE,
    },
    {
      id: item.reviewTaskId,
      title: `Review the ${item.productName}`,
      sprint: JOURNAL_MAKE_REVIEW_SPRINT,
      phase: 'Phase 2',
      category: 'QA & Testing',
      priority: 'high',
      status: 'not_started',
      assignee: JOURNAL_REVIEW_ASSIGNEE,
      assignor: 'evelyn',
      dueDate: JOURNAL_ANGELA_DUE,
    },
  ]);
}

export function buildJournalMakeReviewQaSeeds(): JournalMakeReviewQaSeed[] {
  return journalMakeReviewQaSpecs().map((spec) => ({
    id: spec.id,
    title: spec.title,
    desc: spec.desc,
    sprint: JOURNAL_MAKE_REVIEW_SPRINT,
    phase: 'Phase 2',
    category: 'Content QA',
    priority: 'high',
    status: 'untested',
    assignee: JOURNAL_REVIEW_ASSIGNEE,
    assignor: 'evelyn',
    dueDate: JOURNAL_ANGELA_DUE,
  }));
}

export function journalMakeReviewTaskContent(): Record<string, JournalMakeReviewContentSeed> {
  return Object.fromEntries(
    JOURNAL_MAKE_REVIEW_ITEMS.flatMap((item) => [
      [item.makeTaskId, makeTaskContent(item)],
      [item.reviewTaskId, reviewTaskContent(item)],
    ]),
  );
}

export function journalMakeReviewQaContent(): Record<string, JournalMakeReviewContentSeed> {
  return Object.fromEntries(
    journalMakeReviewQaSpecs().map((spec) => [
      spec.id,
      { description: spec.description, steps: spec.steps },
    ]),
  );
}

export function journalMakeReviewPageHrefs(): Record<string, string> {
  return {
    ...Object.fromEntries(
      JOURNAL_MAKE_REVIEW_ITEMS.flatMap((item) => [
        [item.makeTaskId, JOURNAL_PLANNERS_HREF],
        [item.reviewTaskId, JOURNAL_PLANNERS_HREF],
        [item.testId, JOURNAL_PLANNERS_HREF],
      ]),
    ),
  };
}

export function journalMakeReviewTaskToTestLinks(): Record<string, string[]> {
  return Object.fromEntries(
    JOURNAL_MAKE_REVIEW_ITEMS.flatMap((item) => [
      [item.makeTaskId, [item.testId]],
      [item.reviewTaskId, [item.testId]],
    ]),
  );
}
