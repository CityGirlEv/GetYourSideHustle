/**
 * Candace legal-review QA — site disclaimer, Beta Tester NDA, and signup confirmation email.
 * Lives on the current open sprint (never closed 0–2).
 */

import type { TestCase } from "./gysh-test-plan";
import { currentSprintIndex, dueDatePlusDays } from "./gysh-sprints";

export const LEGAL_REVIEW_CASE_IDS = [
  "LEGAL-DISC-001",
  "LEGAL-NDA-001",
  "LEGAL-SIGNUP-001",
] as const;

export type LegalReviewCaseId = (typeof LEGAL_REVIEW_CASE_IDS)[number];

export function isLegalReviewCaseId(caseId: string): boolean {
  return LEGAL_REVIEW_CASE_IDS.includes(String(caseId || "").toUpperCase() as LegalReviewCaseId);
}

/** Current open sprint — Sprint 3 while this launch window is live. */
export function legalReviewSprint(ref: Date = new Date()): number {
  return Math.max(1, currentSprintIndex(ref));
}

/** Due today so they show in Candace’s assigned-items login popup. */
export function legalReviewDueDate(_caseId: string, ref: Date = new Date()): string {
  return dueDatePlusDays(0, ref);
}

export const LEGAL_REVIEW_CASES: TestCase[] = [
  {
    id: "LEGAL-DISC-001",
    area: "Legal",
    title: "Review the site legal disclaimer",
    priority: "P1",
    roles: ["qa", "admin"],
    assignees: ["candace"],
    suite: "manual",
    steps: [
      "Open [Home](/) and scroll to the footer legal disclaimer (“Your hustle, your results.”)",
      "Confirm the same disclaimer appears on Join, Guides, and at least one other public page",
      "Read the full text: income examples are educational only, not guarantees; GYSH does not provide financial, legal, tax, or investment advice; consult licensed professionals",
      "Flag missing, contradictory, or legally insufficient wording (promises of income, “guaranteed” results, missing advice disclaimer)",
      "Note recommended edits in the Testing Portal, then set Pass / Conditional / Fail",
    ],
    expected:
      "Disclaimer is consistent, readable, and legally adequate — no income guarantees; advice disclaimer is present",
    path: "dashboard",
  },
  {
    id: "LEGAL-NDA-001",
    area: "Legal",
    title: "Review the Beta Tester Confidentiality & NDA",
    priority: "P1",
    roles: ["qa", "admin"],
    assignees: ["candace"],
    suite: "manual",
    steps: [
      "Open [Beta Tester NDA](/beta-nda)",
      "Confirm the document title, GYSH-BETA-NDA-v1.0 version, and effective-date line are present",
      "Read every numbered section (confidentiality, feedback, term, electronic acceptance)",
      "Flag unclear, missing, contradictory, or legally risky language",
      "On Join → Membership Sign-up, check Apply as a Beta Tester and confirm the NDA scroll, full legal name, matching signature, and I have read and agree controls match the published agreement",
      "Note recommended edits in the Testing Portal, then set Pass / Conditional / Fail",
    ],
    expected:
      "NDA is complete and publish-ready; signup acceptance matches the published agreement (or issues are noted)",
    path: "beta_nda",
  },
  {
    id: "LEGAL-SIGNUP-001",
    area: "Registration",
    title: "Membership signup sends a confirmation email",
    priority: "P0",
    roles: ["qa", "admin"],
    assignees: ["candace"],
    suite: "manual",
    steps: [
      "Log out (or use a private window) and open [Membership Sign-up](/membership)",
      "Register a new adult account with a mailbox you control (unique email + password)",
      "Confirm the on-site success / pending-activation message",
      "Check that mailbox for the Registration confirmation email from Get Your Side Hustle",
      "Open the email and confirm subject, greeting, and next-step copy (admin still activates the account)",
      "Optional: open [Users Area](/admin?tab=users) — confirm the new signup row is pending",
      "Note inbox result (received / missing / spam) in the Testing Portal, then set Pass / Conditional / Fail",
    ],
    expected:
      "Signup succeeds and the registration confirmation email is received (or a clear Fail/Blocked note if it is not)",
    path: "membership_signup",
  },
];
