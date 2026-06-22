import type { ArticleCategory } from "@/lib/learning-center";
import { MPD_DISCLAIMER } from "@/lib/medicare-disclaimers";

export { buildFeaturedImagePrompt } from "@/lib/learning-center-image-prompts";

export interface ArticleDraft {
  title: string;
  slug: string;
  excerpt: string;
  category: ArticleCategory;
  metaDescription: string;
  featuredImage?: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  publishedAt: string;
  lastUpdated?: string;
  relatedSlugs?: string[];
  downloadLabel?: string;
  downloadPath?: string;
  bodyMd: string;
}

export function slugifyArticleTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function yamlQuote(value: string): string {
  if (!value) return '""';
  if (/[:#\n"'&]/.test(value) || value.startsWith(" ") || value.endsWith(" ")) {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return value;
}

/** Standard FAQ block appended to Learning Center articles when authors omit one. */
export const LEARNING_ARTICLE_FAQ_BLOCK = `## Frequently asked questions

### Is this article enrollment advice?
No. Learning Center articles are educational only. They do not recommend specific plans, carriers, or enrollment actions.

### Where should I verify official Medicare rules?
Use [Medicare.gov](https://www.medicare.gov), 1-800-MEDICARE, or your State Health Insurance Assistance Program (SHIP) for rules that apply to you.`;

const LEGACY_MPD_PATTERN =
  /We do not (?:offer|present) every plan available in your area\.[\s\S]*?all of your options\./g;

/** Ensure article markdown ends with the current MPD footer (replaces legacy "offer" wording). */
export function ensureArticleMpdFooter(bodyMd: string): string {
  let body = bodyMd.trim();
  body = body.replace(LEGACY_MPD_PATTERN, MPD_DISCLAIMER);
  if (body.includes("We may not present every plan available in your area")) return body;
  return `${body}\n\n---\n\n${MPD_DISCLAIMER}\n`;
}

export function ensureArticleFaqBlock(bodyMd: string): string {
  if (/^##\s+frequently asked questions\s*$/im.test(bodyMd)) return bodyMd.trim();
  return `${bodyMd.trim()}\n\n${LEARNING_ARTICLE_FAQ_BLOCK}\n`;
}

/** Build markdown file content for the articles/ folder. */
export function serializeArticleMarkdown(draft: ArticleDraft): string {
  const featuredImage = draft.featuredImage?.trim() ?? "";
  const lines = [
    "---",
    `title: ${yamlQuote(draft.title)}`,
    `slug: ${draft.slug}`,
    `excerpt: ${yamlQuote(draft.excerpt)}`,
    `category: ${draft.category}`,
    `metaDescription: ${yamlQuote(draft.metaDescription)}`,
    `featuredImage: ${yamlQuote(featuredImage)}`,
    `featured: ${draft.featured ? "true" : "false"}`,
    `published: ${draft.published ? "true" : "false"}`,
    `sortOrder: ${draft.sortOrder}`,
    `publishedAt: ${draft.publishedAt}`,
  ];
  if (draft.lastUpdated?.trim()) lines.push(`lastUpdated: ${draft.lastUpdated.trim()}`);
  if (draft.relatedSlugs?.length) lines.push(`relatedSlugs: ${draft.relatedSlugs.join(", ")}`);
  if (draft.downloadLabel?.trim()) lines.push(`downloadLabel: ${yamlQuote(draft.downloadLabel.trim())}`);
  if (draft.downloadPath?.trim()) lines.push(`downloadPath: ${yamlQuote(draft.downloadPath.trim())}`);
  lines.push("---", "", ensureArticleMpdFooter(ensureArticleFaqBlock(draft.bodyMd)), "");
  return lines.join("\n");
}

export function featuredImagePublicPath(slug: string, ext: string): string {
  const safeExt = ext.replace(/^\./, "").toLowerCase() || "jpg";
  return `/learning-center/${slug}.${safeExt}`;
}

export function downloadTextFile(filename: string, content: string, mime = "text/markdown;charset=utf-8"): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadBlobFile(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:([^;]+)/)?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export function fileExtensionFromName(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  return ext && /^[a-z0-9]+$/.test(ext) ? ext : "webp";
}
