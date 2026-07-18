/** Shared sprint / project completion helpers for Admin Schedule + Testing Portal. */

import { BACKLOG_SPRINT, currentSprintIndex, getSprintWindow, themeForSprint } from "./gysh-sprints";
import type { BoardCard } from "./gysh-sprint-board";

export function progressPercent(done: number, total: number): number {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export function isBoardCardDone(card: BoardCard): boolean {
  return card.status === "done";
}

export type SprintProgressSlice = {
  sprintIndex: number;
  label: string;
  rangeLabel: string;
  theme?: string;
  done: number;
  total: number;
  percent: number;
};

export type ProjectProgressSummary = {
  current: SprintProgressSlice;
  overall: {
    done: number;
    total: number;
    percent: number;
  };
};

/** Exclude backlog; count plan/task/test board cards with status === done. */
export function summarizeBoardProgress(
  cards: BoardCard[],
  ref: Date = new Date(),
): ProjectProgressSummary {
  const committed = cards.filter((c) => c.sprint !== BACKLOG_SPRINT);
  const overallDone = committed.filter(isBoardCardDone).length;
  const sprintIndex = currentSprintIndex(ref);
  const window = getSprintWindow(sprintIndex, ref);
  const theme = themeForSprint(sprintIndex);
  const sprintCards = committed.filter((c) => c.sprint === sprintIndex);
  const sprintDone = sprintCards.filter(isBoardCardDone).length;

  return {
    current: {
      sprintIndex,
      label: window.label,
      rangeLabel: window.rangeLabel,
      theme: theme?.theme,
      done: sprintDone,
      total: sprintCards.length,
      percent: progressPercent(sprintDone, sprintCards.length),
    },
    overall: {
      done: overallDone,
      total: committed.length,
      percent: progressPercent(overallDone, committed.length),
    },
  };
}
