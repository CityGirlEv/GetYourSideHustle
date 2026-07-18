import { DEFAULT_WORKBOOK_LEAD_MAGNET } from "@/lib/content-factory/batch-seed";

export type BenchmarkWorkbookListSection = {
  id: string;
  title: string;
  items: string[];
};

export type BenchmarkWorkbookWritingSection = {
  id: string;
  title: string;
  hint: string;
  lines: number;
  variant?: "single" | "drug-table";
};

export type BenchmarkWorkbookContent = {
  title: string;
  excerpt: string;
  checklistSections: BenchmarkWorkbookListSection[];
  writingSections: BenchmarkWorkbookWritingSection[];
  disclaimer: string;
};

const AGENT_QUESTIONS_SECTION_TITLE = "Questions to Ask your Agent";

function parseMarkdownListSection(body: string, heading: string): string[] {
  const pattern = new RegExp(`## ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`);
  const match = body.match(pattern);
  if (!match?.[1]) return [];
  return match[1]
    .split("\n")
    .map((line) => line.replace(/^\s*-\s*/, "").trim())
    .filter(Boolean);
}

/** Structured Medicare planning workbook for in-report HTML preview. */
export function getBenchmarkWorkbookContent(): BenchmarkWorkbookContent {
  const { title, excerpt, body } = DEFAULT_WORKBOOK_LEAD_MAGNET;

  const checklistSections: BenchmarkWorkbookListSection[] = [
    {
      id: "workbook-before-compare",
      title: "Before you compare plans",
      items: parseMarkdownListSection(body, "Before you compare plans"),
    },
    {
      id: "workbook-agent-questions",
      title: AGENT_QUESTIONS_SECTION_TITLE,
      items: parseMarkdownListSection(body, "Questions for your review meeting"),
    },
    {
      id: "workbook-official-sources",
      title: "Official sources to verify",
      items: parseMarkdownListSection(body, "Official sources to verify"),
    },
  ];

  const writingSections: BenchmarkWorkbookWritingSection[] = [
    {
      id: "workbook-extra-prescriptions",
      title: "Additional prescriptions",
      hint: "Drug name, exact dosage, and how often you take each medication.",
      lines: 4,
      variant: "drug-table",
    },
    {
      id: "workbook-providers",
      title: "Preferred doctors, specialists & hospitals",
      hint: "Names, specialties, and locations you want to keep when comparing plans.",
      lines: 4,
    },
    {
      id: "workbook-extra-questions",
      title: "Additional questions for your agent",
      hint: "Use these lines if you think of more to ask at your review meeting.",
      lines: 4,
    },
  ];

  const disclaimer =
    body
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && !line.startsWith("-"))
      .find((line) => /educational workbook only/i.test(line)) ??
    "Educational workbook only — not personalized enrollment advice.";

  return {
    title,
    excerpt,
    checklistSections,
    writingSections,
    disclaimer,
  };
}

export const BENCHMARK_WORKBOOK_SECTION_ID = "benchmark-workbook";

/** Workbook sections #2–#4 start on a new page in print and PDF exports. */
export const WORKBOOK_SECTION_PAGE_BREAK_IDS = new Set([
  "workbook-agent-questions",
  "workbook-official-sources",
  "workbook-extra-prescriptions",
]);

export function workbookSectionStartsNewPage(sectionId: string): boolean {
  return WORKBOOK_SECTION_PAGE_BREAK_IDS.has(sectionId);
}

export type EnumeratedChecklistItem = {
  sectionId: string;
  sectionIndex: number;
  itemIndex: number;
  /** 1-based index across all checklist sections. */
  globalNumber: number;
  item: string;
};

/** Total checkbox items across every checklist section (continuous numbering in UI). */
export function totalChecklistItemCount(workbook?: BenchmarkWorkbookContent): number {
  const content = workbook ?? getBenchmarkWorkbookContent();
  return content.checklistSections.reduce((sum, section) => sum + section.items.length, 0);
}

/** Flat list of checklist items with stable keys and global 1-based numbers. */
export function enumerateChecklistItems(
  workbook?: BenchmarkWorkbookContent,
): EnumeratedChecklistItem[] {
  const content = workbook ?? getBenchmarkWorkbookContent();
  const items: EnumeratedChecklistItem[] = [];
  let globalNumber = 0;
  content.checklistSections.forEach((section, sectionIndex) => {
    section.items.forEach((item, itemIndex) => {
      globalNumber += 1;
      items.push({
        sectionId: section.id,
        sectionIndex,
        itemIndex,
        globalNumber,
        item,
      });
    });
  });
  return items;
}
