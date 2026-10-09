import { savePendingJoinReturn } from "./pending-join-return";

/** Public Welcome issue. The puzzle is open; the answer key needs a signed-in account. */
export const WELCOME_VOL1_ID = "welcome-vol-1";
export const WELCOME_VOL1_TITLE = "GYSH Welcome Vol 1";
export const WELCOME_VOL1_DATE = "2026-10-05";
export const WELCOME_VOL1_PATH = "/newsletter/welcome-vol-1";
export const WELCOME_VOL1_ANSWER_PATH = "/newsletter/welcome-vol-1/answer";
export const WELCOME_VOL1_PDF_PATH = "/newsletters/gysh-welcome-vol1.pdf";

/** 10×10 letter grid transcribed from the October 5, 2026 answer key. */
export const WELCOME_VOL1_GRID = [
  "YTINUMMOCA",
  "CMNRAELDJM",
  "BHANJSHWBW",
  "BLUEPRINTE",
  "EFUSRXOSHK",
  "DPETTDOHCU",
  "IFAMILYJTD",
  "UGANIVEKAF",
  "GNXWORGHMA",
  "ADRAZIWAZT",
] as const;

export const WELCOME_VOL1_WORDS = [
  "Hustle",
  "Blueprint",
  "Family",
  "Match",
  "Dream",
  "Community",
  "Wizard",
  "Learn",
  "Kevina",
  "Guide",
  "Grow",
  "Duke",
] as const;

const DIRECTIONS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
] as const;

/** A free account is enough. Guests stay on the join / sign-in gate. */
export function canAccessWelcomeAnswer(isLoggedIn: boolean): boolean {
  return isLoggedIn;
}

export function welcomeGridRows(): string[][] {
  return WELCOME_VOL1_GRID.map((row) => row.split(""));
}

/** True when every listed word appears in a straight line, including backwards. */
export function welcomeWordsAreInGrid(
  grid: readonly string[] = WELCOME_VOL1_GRID,
  words: readonly string[] = WELCOME_VOL1_WORDS,
): boolean {
  const rows = grid.map((row) => row.split(""));
  const height = rows.length;
  const width = rows[0]?.length ?? 0;
  return words.every((word) => {
    const target = word.toUpperCase();
    for (let r = 0; r < height; r += 1) {
      for (let c = 0; c < width; c += 1) {
        for (const [dr, dc] of DIRECTIONS) {
          let found = true;
          for (let i = 0; i < target.length; i += 1) {
            const rr = r + dr * i;
            const cc = c + dc * i;
            if (rr < 0 || cc < 0 || rr >= height || cc >= width || rows[rr][cc] !== target[i]) {
              found = false;
              break;
            }
          }
          if (found) return true;
        }
      }
    }
    return false;
  });
}

/** After Join or Sign in, bring the member back to the answer key. */
export function saveWelcomeAnswerJoinReturn() {
  return savePendingJoinReturn({ view: "welcome_vol1_answer" });
}
