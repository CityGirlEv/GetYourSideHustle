import { describe, expect, it } from "vitest";
import {
  enumerateChecklistItems,
  getBenchmarkWorkbookContent,
  totalChecklistItemCount,
  workbookSectionStartsNewPage,
} from "@/lib/benchmark-workbook-content";

describe("benchmark-workbook-content", () => {
  it("parses checklist sections from canonical workbook markdown", () => {
    const workbook = getBenchmarkWorkbookContent();

    expect(workbook.title).toBe("Part B Optimizer (PBO) Turning 65 Workbook");
    expect(workbook.checklistSections).toHaveLength(3);
    expect(workbook.checklistSections[0]?.title).toBe("Before you compare plans");
    expect(workbook.checklistSections[0]?.items.length).toBeGreaterThan(0);
    expect(workbook.checklistSections[1]?.title).toBe("Questions to Ask your Agent");
    expect(workbook.checklistSections[1]?.items).toContain(
      "Do I need Part B now or can I delay without a penalty?",
    );
    expect(workbook.checklistSections[2]?.title).toBe("Official sources to verify");
    expect(workbook.writingSections.length).toBeGreaterThan(0);
    expect(workbook.disclaimer).toMatch(/educational workbook only/i);
  });

  it("assigns continuous global numbers across sections", () => {
    const workbook = getBenchmarkWorkbookContent();
    const items = enumerateChecklistItems(workbook);

    expect(items).toHaveLength(totalChecklistItemCount(workbook));
    expect(items[0]?.globalNumber).toBe(1);
    expect(items.at(-1)?.globalNumber).toBe(totalChecklistItemCount(workbook));
  });

  it("marks sections 2–4 for fresh page starts", () => {
    expect(workbookSectionStartsNewPage("workbook-before-compare")).toBe(false);
    expect(workbookSectionStartsNewPage("workbook-agent-questions")).toBe(true);
    expect(workbookSectionStartsNewPage("workbook-official-sources")).toBe(true);
    expect(workbookSectionStartsNewPage("workbook-extra-prescriptions")).toBe(true);
    expect(workbookSectionStartsNewPage("workbook-providers")).toBe(false);
  });
});
