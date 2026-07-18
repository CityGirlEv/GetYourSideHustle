import { describe, expect, it } from "vitest";
import { getBenchmarkWorkbookContent } from "@/lib/benchmark-workbook-content";
import {
  buildWorkbookAnswersPdf,
  formatWorkbookAnswersAsText,
  workbookAnswersDownloadFilename,
} from "@/lib/workbook-answers-export";
import { emptyWorkbookFormState, workbookFormHasAnswers } from "@/lib/workbook-form-state";
import { PUBLIC_WEBSITE_HOST } from "@/lib/site-url";

const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

describe("workbook answers export", () => {
  const workbook = getBenchmarkWorkbookContent();
  const savedAt = new Date("2026-06-29T12:00:00");

  it("names the answers PDF download", () => {
    expect(workbookAnswersDownloadFilename()).toBe("PBO_Turning_65_Workbook-my-answers.pdf");
  });

  it("detects when the form has saved answers", () => {
    const empty = emptyWorkbookFormState(workbook);
    expect(workbookFormHasAnswers(empty)).toBe(false);

    expect(
      workbookFormHasAnswers({
        ...empty,
        checked: { ...empty.checked, "workbook-before-compare:0": true },
      }),
    ).toBe(true);

    expect(
      workbookFormHasAnswers({
        ...empty,
        lines: { "workbook-providers:line-0": "Dr. Smith" },
      }),
    ).toBe(true);
  });

  it("formats checklist, notes, and writing sections as text", () => {
    const state = emptyWorkbookFormState(workbook);
    state.checked["workbook-before-compare:0"] = true;
    state.lines["workbook-agent-questions:notes:line-0"] = "Ask about Part B timing";
    state.lines["workbook-extra-prescriptions:drug-0"] = "Metformin";
    state.lines["workbook-extra-prescriptions:dose-0"] = "500mg daily";

    const text = formatWorkbookAnswersAsText(workbook, state, savedAt);

    expect(text).toMatch(/My saved answers/);
    expect(text).toMatch(/Before you compare plans/);
    expect(text).toMatch(/\[x\]/);
    expect(text).toMatch(/1\./);
    expect(text).toMatch(/Ask about Part B timing/);
    expect(text).toMatch(/Metformin — 500mg daily/);
    expect(text).toMatch(/educational workbook only/i);
  });

  it("builds a filled workbook template PDF with checklist marks and notes", () => {
    const state = emptyWorkbookFormState(workbook);
    state.checked["workbook-before-compare:0"] = true;
    state.lines["workbook-agent-questions:notes:line-0"] = "Ask about Part B timing";
    state.lines["workbook-extra-prescriptions:drug-0"] = "Metformin";
    state.lines["workbook-extra-prescriptions:dose-0"] = "500mg daily";

    const doc = buildWorkbookAnswersPdf(workbook, state, TINY_PNG);
    const bytes = new TextDecoder("latin1").decode(new Uint8Array(doc.output("arraybuffer")));

    expect(doc.output("arraybuffer").byteLength).toBeGreaterThan(5000);
    expect(bytes).toMatch(/TURNING 65 WORKBOOK/i);
    expect(bytes).toMatch(/Ask about Part B timing/);
    expect(bytes).toMatch(/Metformin/);
    expect(bytes).toMatch(/500mg daily/);
    expect(bytes).toContain(PUBLIC_WEBSITE_HOST);
    expect(doc.getNumberOfPages()).toBeGreaterThan(1);
  });

  it("includes seeded prescription names and doses in the workbook PDF", () => {
    const state = emptyWorkbookFormState(workbook);
    state.lines["workbook-extra-prescriptions:drug-0"] = "Lisinopril";
    state.lines["workbook-extra-prescriptions:dose-0"] = "10 mg · tablet · daily";

    const doc = buildWorkbookAnswersPdf(workbook, state, TINY_PNG);
    const bytes = new TextDecoder("latin1").decode(new Uint8Array(doc.output("arraybuffer")));

    expect(bytes).toMatch(/Lisinopril/);
    expect(bytes).toMatch(/10 mg/);
    expect(bytes).toMatch(/tablet/);
  });
});
