/** Shared sprint / project completion helpers for Admin Schedule + Testing Portal. */

import {
  BACKLOG_SPRINT,
  DEFAULT_SPRINT_COUNT,
  currentSprintIndex,
  getSprintWindow,
  listUpcomingSprints,
  themeForSprint,
} from "./gysh-sprints";
import type { BoardCard } from "./gysh-sprint-board";

export function progressPercent(done: number, total: number): number {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export function isBoardCardDone(card: BoardCard): boolean {
  return card.status === "done";
}

/** Face status counts Tasks + Tests only (Plan milestones excluded). */
export function isWorkBoardCard(card: BoardCard): boolean {
  return card.source === "task" || card.source === "test";
}

export type WorkBreakdown = {
  tasks: number;
  tests: number;
  tasksDone: number;
  testsDone: number;
  done: number;
  total: number;
  percent: number;
};

export type SprintProgressSlice = WorkBreakdown & {
  sprintIndex: number;
  label: string;
  rangeLabel: string;
  theme?: string;
  isCurrent: boolean;
};

export type ProjectProgressSummary = {
  current: SprintProgressSlice;
  overall: WorkBreakdown;
  /** One row per committed sprint (S0…S7), Tests-above-Tasks friendly. */
  sprints: SprintProgressSlice[];
};

function emptyBreakdown(): WorkBreakdown {
  return {
    tasks: 0,
    tests: 0,
    tasksDone: 0,
    testsDone: 0,
    done: 0,
    total: 0,
    percent: 0,
  };
}

function tallyWork(cards: BoardCard[]): WorkBreakdown {
  let tasks = 0;
  let tests = 0;
  let tasksDone = 0;
  let testsDone = 0;
  for (const c of cards) {
    const done = isBoardCardDone(c);
    if (c.source === "task") {
      tasks += 1;
      if (done) tasksDone += 1;
    } else if (c.source === "test") {
      tests += 1;
      if (done) testsDone += 1;
    }
  }
  const done = tasksDone + testsDone;
  const total = tasks + tests;
  return {
    tasks,
    tests,
    tasksDone,
    testsDone,
    done,
    total,
    percent: progressPercent(done, total),
  };
}

/**
 * Exclude backlog and Plan items; count task/test board cards with status === done.
 * Headline done/total matches Schedule sprint bubbles (Tasks + Tests only).
 */
export function summarizeBoardProgress(
  cards: BoardCard[],
  ref: Date = new Date(),
): ProjectProgressSummary {
  const work = cards.filter(isWorkBoardCard);
  const committed = work.filter((c) => c.sprint !== BACKLOG_SPRINT);
  const overall = tallyWork(committed);
  const sprintIndex = currentSprintIndex(ref);
  const windows = listUpcomingSprints(DEFAULT_SPRINT_COUNT, ref);

  const sprints: SprintProgressSlice[] = windows.map((window) => {
    const sprintCards = committed.filter((c) => Number(c.sprint) === window.index);
    const theme = themeForSprint(window.index);
    const breakdown = tallyWork(sprintCards);
    return {
      sprintIndex: window.index,
      label: window.label,
      rangeLabel: window.rangeLabel,
      theme: theme?.goal ?? theme?.theme,
      isCurrent: window.index === sprintIndex,
      ...breakdown,
    };
  });

  const current =
    sprints.find((s) => s.isCurrent) ??
    (() => {
      const window = getSprintWindow(sprintIndex, ref);
      const theme = themeForSprint(sprintIndex);
      return {
        sprintIndex,
        label: window.label,
        rangeLabel: window.rangeLabel,
        theme: theme?.goal ?? theme?.theme,
        isCurrent: true,
        ...emptyBreakdown(),
      };
    })();

  return { current, overall, sprints };
}
