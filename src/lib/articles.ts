import type { ArticleCategory } from "@/lib/learning-center";
import { estimateReadMinutes } from "@/lib/learning-center";

export interface ArticleFrontmatter {
  title: string;
  slug: string;
  excerpt: string;
  category: ArticleCategory;
  metaDescription: string;
  featuredImage?: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  publishedAt: string | null;
  lastUpdated?: string | null;
  relatedSlugs?: string[];
  downloadLabel?: string;
  downloadPath?: string;
}

export interface Article extends ArticleFrontmatter {
  bodyMd: string;
}

export interface ArticleListItem extends Omit<Article, "bodyMd"> {
  readMinutes: number;
}

const ARTICLE_CATEGORIES: ArticleCategory[] = [
  "plan-types",
  "enrollment",
  "costs",
  "comparing-plans",
  "staying-informed",
];

const articleModules = import.meta.glob("../../articles/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function parseYamlValue(raw: string): string | boolean | number {
  const value = raw.trim();
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^\d+$/.test(value)) return Number(value);
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

/** Parse simple YAML frontmatter (key: value lines). Exported for tests. */
export function parseArticleMarkdown(raw: string): Article {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error("Article must start with YAML frontmatter delimited by ---");

  const fields: Record<string, string | boolean | number> = {};
  for (const line of match[1].split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const colon = trimmed.indexOf(":");
    if (colon === -1) continue;
    const key = trimmed.slice(0, colon).trim();
    fields[key] = parseYamlValue(trimmed.slice(colon + 1));
  }

  const category = String(fields.category ?? "");
  if (!ARTICLE_CATEGORIES.includes(category as ArticleCategory)) {
    throw new Error(`Invalid article category: ${category}`);
  }

  const slug = String(fields.slug ?? "").trim();
  const title = String(fields.title ?? "").trim();
  if (!slug || !title) throw new Error("Article requires title and slug in frontmatter");

  const featuredImage = String(fields.featuredImage ?? "").trim();
  const relatedRaw = String(fields.relatedSlugs ?? "").trim();
  const relatedSlugs = relatedRaw
    ? relatedRaw.split(",").map((slug) => slug.trim()).filter(Boolean)
    : undefined;
  const downloadLabel = String(fields.downloadLabel ?? "").trim();
  const downloadPath = String(fields.downloadPath ?? "").trim();
  const lastUpdatedRaw = String(fields.lastUpdated ?? "").trim();

  return {
    title,
    slug,
    excerpt: String(fields.excerpt ?? "").trim(),
    category: category as ArticleCategory,
    metaDescription: String(fields.metaDescription ?? "").trim(),
    featuredImage: featuredImage || undefined,
    featured: Boolean(fields.featured),
    published: fields.published !== false,
    sortOrder: Number(fields.sortOrder ?? 0),
    publishedAt: fields.publishedAt ? String(fields.publishedAt) : null,
    lastUpdated: lastUpdatedRaw || undefined,
    relatedSlugs,
    downloadLabel: downloadLabel || undefined,
    downloadPath: downloadPath || undefined,
    bodyMd: match[2].trim(),
  };
}

function loadAllArticles(): Article[] {
  return Object.values(articleModules).map((raw) => parseArticleMarkdown(raw));
}

let cachedArticles: Article[] | undefined;

function allArticles(): Article[] {
  if (!cachedArticles) cachedArticles = loadAllArticles();
  return cachedArticles;
}

function sortArticles<T extends { sortOrder: number; publishedAt: string | null }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return bTime - aTime;
  });
}

function toListItem(article: Article): ArticleListItem {
  const { bodyMd, ...listItem } = article;
  return {
    ...listItem,
    readMinutes: estimateReadMinutes(bodyMd),
  };
}

export function listPublishedArticles(category: ArticleCategory | "all" = "all"): ArticleListItem[] {
  const published = allArticles().filter((a) => a.published);
  const filtered =
    category === "all" ? published : published.filter((a) => a.category === category);
  return sortArticles(filtered).map(toListItem);
}

export function getPublishedArticleBySlug(slug: string): Article | null {
  return allArticles().find((a) => a.published && a.slug === slug) ?? null;
}

export function listPublishedArticleSlugs(): string[] {
  return listPublishedArticles().map((a) => a.slug);
}

export function getRelatedArticles(article: Article, limit = 3): ArticleListItem[] {
  const published = listPublishedArticles().filter((a) => a.slug !== article.slug);
  if (article.relatedSlugs?.length) {
    const picked = article.relatedSlugs
      .map((slug) => published.find((a) => a.slug === slug))
      .filter((a): a is ArticleListItem => Boolean(a));
    if (picked.length) return picked.slice(0, limit);
  }

  return published.filter((a) => a.category === article.category).slice(0, limit);
}

export function getArticleNeighbors(slug: string): {
  previous: ArticleListItem | null;
  next: ArticleListItem | null;
} {
  const ordered = listPublishedArticles();
  const index = ordered.findIndex((a) => a.slug === slug);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: index > 0 ? ordered[index - 1] : null,
    next: index < ordered.length - 1 ? ordered[index + 1] : null,
  };
}
