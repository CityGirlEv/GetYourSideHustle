/**
 * Canonical GYSH Beta Testing Program copy (executive brief).
 */

import {
  BETA_CREDIT_PRIORITY_ROWS,
  BETA_CREDIT_SPEND_RULES,
  BETA_CREDIT_ZERO_STATUSES,
  BETA_REPRO_FAIL_BONUS,
  BETA_REWARD_LEVELS,
} from "./beta-tester-credits";
import { BETA_RETEST_BONUS } from "./beta-tester-points";

export const BETA_PROGRAM_DOC_TITLE = "GYSH Beta Testing Program";
export const BETA_PROGRAM_DOC_SUBTITLE = "Executive briefing for testers, partners, and program leads";
export const BETA_PROGRAM_EFFECTIVE = "August 26, 2026";
export const BETA_PROGRAM_PDF_FILENAME = "GYSH-Beta-Testing-Program.pdf";
export const BETA_PROGRAM_WORD_FILENAME = "GYSH-Beta-Testing-Program.doc";

export type BetaProgramBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };

export type BetaProgramSection = {
  id: string;
  heading: string;
  blocks: BetaProgramBlock[];
};

export const BETA_PROGRAM_INTRO: string[] = [
  "Get Your Side Hustle (“GYSH”) operates a structured Beta Testing Program so invited testers can exercise the live product, record honest results, and earn Kid Credits that redeem on the member account.",
  "This briefing is the program of record. It is written for executives, partners, and testers who need a single, citable statement of purpose, eligibility, scoring, and spend rules.",
];

export const BETA_PROGRAM_SECTIONS: BetaProgramSection[] = [
  {
    id: "purpose",
    heading: "1. Purpose",
    blocks: [
      {
        type: "p",
        text: "The program exists to find defects before public launch, confirm that family-safe flows behave as designed, and reward testers in a transparent, auditable way. Credits are Kid Credits on the GYSH member ledger — not cash and not a wage.",
      },
    ],
  },
  {
    id: "who",
    heading: "2. Who may participate",
    blocks: [
      {
        type: "list",
        items: [
          "Applicants who select Beta Tester at registration and accept the current Beta Tester NDA (GYSH-BETA-NDA-v1.0).",
          "QA partners and staff assigned cases in Testing Portal.",
          "Admin activation is required before a public Beta Tester can sign in. The Beta Tester role alone does not grant Admin Studio.",
        ],
      },
    ],
  },
  {
    id: "how-testing-works",
    heading: "3. How testing is conducted",
    blocks: [
      {
        type: "p",
        text: "Work is assigned and recorded in Testing Portal. Each case has numbered steps, an expected result, a priority, and an owner. Testers run the steps, attach evidence when it helps, and set a status with notes that another adult can follow.",
      },
      {
        type: "list",
        items: [
          "Pass or Conditional Pass — the expected result is met, or met with documented conditions.",
          "Fail — the expected result is not met; notes must describe steps, expected versus actual, and evidence.",
          "Fixed / Re-Test and Failed / Re-Test — the case returns to the tester after a development fix or a disputed fail. Completing that second pass earns the re-test bonus below.",
          "Not Run and Blocked earn no credits.",
        ],
      },
    ],
  },
  {
    id: "scoring",
    heading: "4. Points and Kid Credits",
    blocks: [
      {
        type: "p",
        text: "One point equals one Kid Credit. A tester earns the priority amount once per eligible case result (Pass, Conditional Pass, or documented Fail). An additional bonus is awarded when the tester must re-test that case after a fail or a development fix.",
      },
      {
        type: "table",
        headers: ["Priority", "Meaning", "Points (Kid Credits)"],
        rows: BETA_CREDIT_PRIORITY_ROWS.map((row) => [
          `${row.priority} · ${row.label}`,
          row.meaning,
          String(row.credits),
        ]).concat([
          [
            "Re-test bonus",
            "Added when a tester completes a pass (or conditional pass) after a fail, or finishes a Fixed/Re-Test or Failed/Re-Test cycle",
            `+${BETA_RETEST_BONUS}`,
          ],
          [
            "First reproducible Fail bonus",
            "First clear, reproducible Fail on a given case id (reviewed at sprint retro)",
            `+${BETA_REPRO_FAIL_BONUS}`,
          ],
        ]),
      },
      {
        type: "p",
        text: `${BETA_CREDIT_ZERO_STATUSES.join(" and ")} earn 0 points. Empty checkboxes, copy-paste notes, and bad-faith runs do not qualify.`,
      },
    ],
  },
  {
    id: "points-board",
    heading: "5. Live points board",
    blocks: [
      {
        type: "p",
        text: "The Beta Tester Points page lists each tester’s passed cases, re-tests, and running total. Open getyoursidehustle.com/beta-points (footer → Beta Points, or Credit Guide → View points earned).",
      },
    ],
  },
  {
    id: "spend",
    heading: "6. How credits are spent",
    blocks: [
      {
        type: "list",
        items: BETA_CREDIT_SPEND_RULES.map((rule) => `${rule.title}. ${rule.detail}`),
      },
    ],
  },
  {
    id: "levels",
    heading: "7. Reward levels",
    blocks: [
      {
        type: "p",
        text: "The Beta Tester dashboard also shows a volume-based reward level. GYSH may announce additional membership or consulting rewards for a given round under NDA §9.",
      },
      {
        type: "list",
        items: BETA_REWARD_LEVELS.map((level) => {
          const bar = level.minTests > 0 ? ` (${level.minTests}+ eligible tests)` : "";
          return `${level.label}${bar} — ${level.blurb}`;
        }),
      },
    ],
  },
  {
    id: "fair-play",
    heading: "8. Fair play and administration",
    blocks: [
      {
        type: "p",
        text: "Meeting a test-count or time threshold does not excuse fraudulent, incomplete, duplicate, automated, or bad-faith testing. GYSH reviews activity and determines final credit and reward eligibility. Program terms may be updated; the effective date on this briefing controls until a later edition is published.",
      },
    ],
  },
];
