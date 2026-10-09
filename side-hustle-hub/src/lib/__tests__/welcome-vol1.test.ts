import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { parseAppRoute, pathForView, titleForView, viewRequiresMemberLogin } from "../app-routes";
import { clearMemoryStore } from "../browser-storage";
import { clearPendingJoinReturn, consumeJoinReturnView, readPendingJoinReturn } from "../pending-join-return";
import {
  WELCOME_VOL1_ANSWER_PATH,
  WELCOME_VOL1_DATE,
  WELCOME_VOL1_GRID,
  WELCOME_VOL1_PATH,
  WELCOME_VOL1_PDF_PATH,
  WELCOME_VOL1_TITLE,
  WELCOME_VOL1_WORDS,
  canAccessWelcomeAnswer,
  saveWelcomeAnswerJoinReturn,
  welcomeWordsAreInGrid,
} from "../welcome-vol1";

afterEach(() => {
  clearPendingJoinReturn();
  clearMemoryStore();
});

describe("Welcome Vol 1", () => {
  it("routes the public issue and the answer key", () => {
    expect(parseAppRoute(WELCOME_VOL1_PATH)).toEqual({ view: "welcome_vol1", guidesManualId: null });
    expect(parseAppRoute(WELCOME_VOL1_ANSWER_PATH)).toEqual({
      view: "welcome_vol1_answer",
      guidesManualId: null,
    });
    expect(pathForView("welcome_vol1")).toBe(WELCOME_VOL1_PATH);
    expect(pathForView("welcome_vol1_answer")).toBe(WELCOME_VOL1_ANSWER_PATH);
    expect(titleForView("welcome_vol1")).toMatch(/Welcome Vol 1/);
    expect(viewRequiresMemberLogin("welcome_vol1")).toBe(false);
    expect(viewRequiresMemberLogin("welcome_vol1_answer")).toBe(false);
    const publicPdf = join(
      dirname(fileURLToPath(import.meta.url)),
      "../../../public",
      WELCOME_VOL1_PDF_PATH.replace(/^\//, ""),
    );
    expect(existsSync(publicPdf)).toBe(true);
  });

  it("keeps the October 5 puzzle solvable and leaves the answer for signed-in members", () => {
    expect(WELCOME_VOL1_TITLE).toBe("GYSH Welcome Vol 1");
    expect(WELCOME_VOL1_DATE).toBe("2026-10-05");
    expect(WELCOME_VOL1_GRID).toHaveLength(10);
    expect(WELCOME_VOL1_GRID.every((row) => row.length === 10)).toBe(true);
    expect(WELCOME_VOL1_WORDS).toHaveLength(12);
    expect(welcomeWordsAreInGrid()).toBe(true);
    expect(canAccessWelcomeAnswer(false)).toBe(false);
    expect(canAccessWelcomeAnswer(true)).toBe(true);
  });

  it("returns Join and Sign in to the answer key", () => {
    saveWelcomeAnswerJoinReturn();
    expect(readPendingJoinReturn()?.view).toBe("welcome_vol1_answer");
    expect(consumeJoinReturnView("welcome_vol1_answer")).toBe(true);
    expect(readPendingJoinReturn()).toBeNull();
  });
});
