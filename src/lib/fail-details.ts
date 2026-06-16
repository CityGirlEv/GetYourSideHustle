/**
 * Validation + formatting helpers for the "fail details" gate.
 *
 * When a tester flips a test to Fail / Failed-Retest we force them to
 * capture two things in one dialog so the bug is actionable:
 *   - a freeform note describing the failure
 *   - which step (1-based index) the failure occurred on
 *
 * Screenshot attachment is optional (Evidence panel or dialog upload).
 *
 * Keeping the validator pure (no React, no IO) so we can unit-test every
 * reject path without spinning up the dialog.
 */

export interface FailDetailsInput {
  note: string;
  stepIndex: number | null;
}

/** Returns null when the input is complete enough to save, or a
 *  user-facing error string describing the first missing field. */
export function validateFailDetails(input: FailDetailsInput): string | null {
  if (!input.note || input.note.trim().length === 0) {
    return "Add a note describing the failure.";
  }
  if (input.stepIndex == null || input.stepIndex < 0) {
    return "Select which step failed.";
  }
  return null;
}

/** Prepend a structured failure header to the existing QA note so the
 *  step + tester-supplied details are preserved in one place. */
export function formatFailNote(
  previous: string,
  details: { note: string; stepLabel: string; noScreenshot: boolean },
): string {
  const header = `Step ${details.stepLabel} failed: ${details.note.trim()}`;
  const tail = details.noScreenshot ? " (no screenshot available)" : "";
  const block = `${header}${tail}`;
  const prev = (previous ?? "").trim();
  if (!prev) return block;
  if (prev.startsWith(block)) return previous;
  return `${block}\n\n${prev}`;
}
