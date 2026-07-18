import { describe, expect, it, vi } from "vitest";
import {
  applyBulkCurationIncluded,
  buildCurationDraftFromCurated,
  buildPendingCurationDraft,
  filterIncludedCurationTasks,
  isCurationTaskIncluded,
  carrierUploadTabLabel,
  countCarrierRequirements,
  isCarrierChecklistNoiseLine,
  mergeCarrierChecklistLines,
  parseCarrierChecklistLine,
  parseCarrierChecklistText,
  readCarrierChecklistFile,
  resolveCarrierTaskUploadId,
  resolveCurationDraftForUpload,
} from "@/lib/submission-checklist-carrier";

vi.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: { workerSrc: "" },
  getDocument: vi.fn(),
}));

vi.mock("mammoth", () => ({
  default: {
    extractRawText: vi.fn(),
  },
}));

describe("isCarrierChecklistNoiseLine", () => {
  it("filters emails, headers, page numbers, and URL-only lines", () => {
    expect(isCarrierChecklistNoiseLine("")).toBe(true);
    expect(isCarrierChecklistNoiseLine("Task")).toBe(true);
    expect(isCarrierChecklistNoiseLine("contact@carrier.com")).toBe(true);
    expect(isCarrierChecklistNoiseLine("Page 2 of 5")).toBe(true);
    expect(isCarrierChecklistNoiseLine("https://example.com")).toBe(true);
    expect(isCarrierChecklistNoiseLine("Confidential — internal use only")).toBe(true);
    expect(isCarrierChecklistNoiseLine("SMID on landing page")).toBe(false);
  });
});

describe("mergeCarrierChecklistLines", () => {
  it("merges wrapped continuation lines into one deliverable", () => {
    const merged = mergeCarrierChecklistLines([
      "- TPMO disclaimer in primary text",
      "and footer on mobile",
      "contact@humana.com",
      "2 / 5",
    ]);
    expect(merged).toEqual(["TPMO disclaimer in primary text and footer on mobile"]);
  });
});

describe("parseCarrierChecklistLine", () => {
  it("returns null for empty or comment lines", () => {
    expect(parseCarrierChecklistLine("")).toBeNull();
    expect(parseCarrierChecklistLine("   ")).toBeNull();
    expect(parseCarrierChecklistLine("# notes")).toBeNull();
  });

  it("skips short header rows", () => {
    expect(parseCarrierChecklistLine("Task")).toBeNull();
    expect(parseCarrierChecklistLine("Item")).toBeNull();
  });

  it("strips numbered and bullet prefixes", () => {
    expect(parseCarrierChecklistLine("1. SMID on landing page")).toBe("SMID on landing page");
    expect(parseCarrierChecklistLine("- TPMO disclaimer")).toBe("TPMO disclaimer");
    expect(parseCarrierChecklistLine("• Privacy policy link")).toBe("Privacy policy link");
  });

  it("uses first CSV or TSV column", () => {
    expect(parseCarrierChecklistLine("Alpha, Beta, Gamma")).toBe("Alpha");
    expect(parseCarrierChecklistLine("One\tTwo\tThree")).toBe("One");
  });

  it("rejects titles shorter than two characters", () => {
    expect(parseCarrierChecklistLine("A")).toBeNull();
  });
});

describe("parseCarrierChecklistText", () => {
  it("creates one task per deliverable with both assignees", () => {
    const tasks = parseCarrierChecklistText("Line one\n\n- Line two", {
      carrierName: "Humana",
      uploadId: "upload-test",
    });

    expect(tasks).toHaveLength(2);
    expect(tasks[0]?.title).toBe("Line one");
    expect(tasks[1]?.title).toBe("Line two");
    expect(tasks.every((task) => task.uploadId === "upload-test")).toBe(true);
    expect(tasks.every((task) => task.carrierName === "Humana")).toBe(true);
    expect(tasks.every((task) => task.assignee === "both")).toBe(true);
    expect(tasks[0]?.id).toBe("carrier-upload-test-0");
    expect(tasks[1]?.id).toBe("carrier-upload-test-1");
  });

  it("skips noise and keeps deliverables from messy uploads", () => {
    const text = [
      "Checklist",
      "contact@carrier.com",
      "1. SMID on landing page",
      "and in ad footer",
      "Page 3 of 8",
      "- Privacy policy linked from footer",
    ].join("\n");
    const tasks = parseCarrierChecklistText(text, {
      carrierName: "Humana",
      uploadId: "upload-noise",
    });
    expect(tasks.map((task) => task.title)).toEqual([
      "SMID on landing page and in ad footer",
      "Privacy policy linked from footer",
    ]);
  });

  it("defaults carrier name when blank", () => {
    const tasks = parseCarrierChecklistText("Include SMID on landing page", {
      carrierName: "   ",
      uploadId: "upload-default",
    });

    expect(tasks[0]?.carrierName).toBe("Carrier");
  });
});

describe("resolveCarrierTaskUploadId", () => {
  it("prefers explicit uploadId on the task", () => {
    const task = parseCarrierChecklistText("One line", {
      carrierName: "UHC",
      uploadId: "upload-explicit",
    })[0]!;

    expect(resolveCarrierTaskUploadId(task)).toBe("upload-explicit");
  });

  it("falls back to id prefix for legacy tasks", () => {
    expect(
      resolveCarrierTaskUploadId({
        id: "carrier-upload-1234567890-0",
        title: "Legacy",
        description: "",
        assignee: "prep",
        dueDate: "",
        reviewDueDate: "",
        carrierName: "Legacy",
        lineNumber: 1,
        uploadId: "",
      }),
    ).toBe("upload-1234567890");
  });
});

describe("readCarrierChecklistFile", () => {
  it("reads plain text files directly", async () => {
    const file = new File(["Alpha\nBeta"], "checklist.txt", { type: "text/plain" });
    await expect(readCarrierChecklistFile(file)).resolves.toBe("Alpha\nBeta");
  });

  it("rejects legacy .doc files with a clear message", async () => {
    const file = new File(["binary"], "carrier.doc", {
      type: "application/msword",
    });

    await expect(readCarrierChecklistFile(file)).rejects.toThrow(/save as \.docx/i);
  });

  it("rejects unsupported extensions", async () => {
    const file = new File(["data"], "checklist.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    await expect(readCarrierChecklistFile(file)).rejects.toThrow(
      /\.txt, \.csv, \.tsv, \.pdf, or \.docx/i,
    );
  });
});

describe("countCarrierRequirements", () => {
  it("counts saved curated carrier tasks", () => {
    const tasks = parseCarrierChecklistText("One\nTwo\nThree", {
      carrierName: "Humana",
      uploadId: "upload-1",
    });
    expect(countCarrierRequirements(tasks)).toBe(3);
    expect(countCarrierRequirements([])).toBe(0);
  });
});

describe("carrierUploadTabLabel", () => {
  it("shows carrier name with saved requirement count", () => {
    const upload = {
      id: "upload-1",
      carrierName: "Humana",
      uploadedAt: "2026-07-04T12:00:00.000Z",
      originalTaskCount: 5,
      curatedTaskCount: 3,
      curatedAt: "2026-07-04T13:00:00.000Z",
    };
    expect(carrierUploadTabLabel(upload)).toBe("Humana · 3");
    expect(carrierUploadTabLabel(upload, 2)).toBe("Humana · 2");
  });

  it("shows carrier name only for unstaged drafts", () => {
    const upload = {
      id: "upload-2",
      carrierName: "UHC",
      uploadedAt: "2026-07-04T12:00:00.000Z",
      originalTaskCount: 4,
    };
    expect(carrierUploadTabLabel(upload)).toBe("UHC");
  });
});

describe("carrier curation draft helpers", () => {
  const tasks = parseCarrierChecklistText("Alpha\nBeta\nGamma", {
    carrierName: "Humana",
    uploadId: "upload-curation",
  });

  it("buildPendingCurationDraft defaults every upload line to included", () => {
    const draft = buildPendingCurationDraft(tasks);
    expect(Object.values(draft)).toEqual([
      { included: true },
      { included: true },
      { included: true },
    ]);
  });

  it("buildCurationDraftFromCurated mirrors saved curated tasks", () => {
    const draft = buildCurationDraftFromCurated(tasks, [tasks[0]!, tasks[2]!]);
    expect(draft[tasks[0]!.id]?.included).toBe(true);
    expect(draft[tasks[1]!.id]?.included).toBe(false);
    expect(draft[tasks[2]!.id]?.included).toBe(true);
  });

  it("resolveCurationDraftForUpload uses pending defaults before first save", () => {
    const draft = resolveCurationDraftForUpload(undefined, tasks, [], {
      id: "upload-curation",
      carrierName: "Humana",
      uploadedAt: "2026-07-04T12:00:00.000Z",
      originalTaskCount: tasks.length,
    });
    expect(draft[tasks[0]!.id]?.included).toBe(true);
    expect(draft[tasks[1]!.id]?.included).toBe(true);
  });

  it("applyBulkCurationIncluded toggles selected rows for discard", () => {
    const draft = buildPendingCurationDraft(tasks);
    const next = applyBulkCurationIncluded(draft, [tasks[0]!.id, tasks[2]!.id], false);
    expect(next[tasks[0]!.id]?.included).toBe(false);
    expect(next[tasks[1]!.id]?.included).toBe(true);
    expect(next[tasks[2]!.id]?.included).toBe(false);
  });

  it("filterIncludedCurationTasks hides discarded rows from the carrier list", () => {
    const draft = applyBulkCurationIncluded(buildPendingCurationDraft(tasks), [tasks[1]!.id], false);
    expect(isCurationTaskIncluded(tasks[0]!.id, draft)).toBe(true);
    expect(isCurationTaskIncluded(tasks[1]!.id, draft)).toBe(false);
    expect(filterIncludedCurationTasks(tasks, draft).map((task) => task.id)).toEqual([
      tasks[0]!.id,
      tasks[2]!.id,
    ]);
  });
});
