import { TPMO_PLATFORM_DISCLAIMER } from "@/lib/medicare-disclaimers";
import { SITE_BRAND_NAME } from "@/lib/site-brand";

export type ArticleCategory =
  | "plan-types"
  | "enrollment"
  | "costs"
  | "comparing-plans"
  | "staying-informed";

export const LEARNING_CENTER_CATEGORIES: Array<{
  id: ArticleCategory | "all";
  label: string;
  description: string;
}> = [
  { id: "all", label: "All topics", description: "Every published article" },
  {
    id: "plan-types",
    label: "Plan types",
    description: "Original Medicare, Medigap, and Medicare Advantage basics",
  },
  {
    id: "enrollment",
    label: "Enrollment",
    description: "Timing windows and eligibility concepts",
  },
  {
    id: "costs",
    label: "Costs",
    description: "Premiums, cost-sharing, and IRMAA overview",
  },
  {
    id: "comparing-plans",
    label: "Comparing plans",
    description: "Side-by-side educational comparison tips",
  },
  {
    id: "staying-informed",
    label: "Staying informed",
    description: "Official resources and annual review habits",
  },
];

export const LEARNING_ARTICLE_DISCLAIMER =
  `${TPMO_PLATFORM_DISCLAIMER} Articles in the Learning Center are educational only and do not recommend or endorse any specific carrier or plan.`;

export const LEARNING_CENTER_INTRO =
  `${SITE_BRAND_NAME} Learning Center offers plain-language Medicare education. We do not sell insurance or enroll you in coverage.`;

export function categoryLabel(category: ArticleCategory): string {
  return LEARNING_CENTER_CATEGORIES.find((c) => c.id === category)?.label ?? category;
}

export function estimateReadMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export interface ArticleHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface ArticleFaqItem {
  question: string;
  answer: string;
}

export function slugifyHeading(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "section";
}

const FAQ_SECTION_HEADING = /^##\s+frequently asked questions\s*$/i;

export function splitArticleBody(bodyMd: string): {
  mainBody: string;
  faq: ArticleFaqItem[];
} {
  const lines = bodyMd.replace(/\r\n/g, "\n").split("\n");
  const faqStart = lines.findIndex((line) => FAQ_SECTION_HEADING.test(line.trim()));
  if (faqStart === -1) {
    return { mainBody: bodyMd.trim(), faq: [] };
  }

  const mainBody = lines.slice(0, faqStart).join("\n").trim();
  const faqLines = lines.slice(faqStart + 1);
  const faq: ArticleFaqItem[] = [];
  let currentQuestion: string | null = null;
  let answerLines: string[] = [];

  const flush = () => {
    if (currentQuestion && answerLines.length) {
      faq.push({ question: currentQuestion, answer: answerLines.join("\n").trim() });
    }
    currentQuestion = null;
    answerLines = [];
  };

  for (const raw of faqLines) {
    const line = raw.trimEnd();
    if (/^##\s+/.test(line.trim()) && !/^###/.test(line.trim())) break;
    if (/^###\s+/.test(line.trim())) {
      flush();
      currentQuestion = line.trim().slice(4).trim();
      continue;
    }
    if (currentQuestion && line.trim()) {
      answerLines.push(line.trim());
    }
  }
  flush();

  return { mainBody, faq };
}

export function extractHeadings(bodyMd: string): ArticleHeading[] {
  const { mainBody } = splitArticleBody(bodyMd);
  const headings: ArticleHeading[] = [];
  const usedIds = new Set<string>();

  for (const raw of mainBody.split("\n")) {
    const line = raw.trimEnd();
    let level: 2 | 3 | null = null;
    let text = "";
    if (line.startsWith("## ")) {
      level = 2;
      text = line.slice(3).trim();
    } else if (line.startsWith("### ")) {
      level = 3;
      text = line.slice(4).trim();
    }
    if (!level || !text) continue;

    let id = slugifyHeading(text);
    while (usedIds.has(id)) id = `${id}-${usedIds.size}`;
    usedIds.add(id);
    headings.push({ id, text, level });
  }

  return headings;
}

export function formatArticleDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value.includes("T") ? value : `${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function getArticleLastUpdated(article: {
  lastUpdated?: string | null;
  publishedAt: string | null;
}): string | null {
  return article.lastUpdated ?? article.publishedAt;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Safe subset of Markdown for educational articles (no raw HTML). */
export function renderLearningMarkdown(
  bodyMd: string,
  options?: { withHeadingIds?: boolean },
): string {
  const lines = bodyMd.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let inUl = false;
  let inOl = false;
  const headings = options?.withHeadingIds ? extractHeadings(bodyMd) : [];
  let headingIndex = 0;

  const closeLists = () => {
    if (inUl) {
      html.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      html.push("</ol>");
      inOl = false;
    }
  };

  const inline = (text: string) =>
    escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>',
      )
      .replace(/\bIRMAA\b/g, '<abbr title="Income-Related Monthly Adjustment Amount" class="underline decoration-dotted cursor-help">IRMAA</abbr>')
      .replace(/\bIEP\b/g, '<abbr title="Initial Enrollment Period" class="underline decoration-dotted cursor-help">IEP</abbr>')
      .replace(/\bMBI\b/g, '<abbr title="Medicare Beneficiary Identifier" class="underline decoration-dotted cursor-help">MBI</abbr>')
      .replace(/\bDME\b/g, '<abbr title="Durable Medical Equipment" class="underline decoration-dotted cursor-help">DME</abbr>')
      .replace(/\bAEP\b/g, '<abbr title="Annual Enrollment Period" class="underline decoration-dotted cursor-help">AEP</abbr>');

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      closeLists();
      continue;
    }
    if (line.startsWith("## ")) {
      closeLists();
      const heading = headings[headingIndex];
      headingIndex += 1;
      const idAttr = options?.withHeadingIds && heading ? ` id="${heading.id}"` : "";
      html.push(
        `<h2${idAttr} class="font-display text-2xl font-bold mt-8 mb-3 scroll-mt-28">${inline(line.slice(3))}</h2>`,
      );
      continue;
    }
    if (line.startsWith("### ")) {
      closeLists();
      const heading = headings[headingIndex];
      headingIndex += 1;
      const idAttr = options?.withHeadingIds && heading ? ` id="${heading.id}"` : "";
      html.push(
        `<h3${idAttr} class="text-lg font-semibold mt-6 mb-2 scroll-mt-28">${inline(line.slice(4))}</h3>`,
      );
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      if (!inUl) {
        closeLists();
        html.push('<ul class="list-disc list-outside pl-5 space-y-1 my-2">');
        inUl = true;
      }
      html.push(`<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      if (!inOl) {
        closeLists();
        html.push('<ol class="list-decimal list-outside pl-5 space-y-1 my-2">');
        inOl = true;
      }
      html.push(`<li>${inline(line.replace(/^\d+\.\s+/, ""))}</li>`);
      continue;
    }
    closeLists();
    html.push(`<p class="text-base leading-relaxed text-foreground/80 my-4">${inline(line)}</p>`);
  }
  closeLists();
  return html.join("\n");
}
