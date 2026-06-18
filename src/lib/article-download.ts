import type { ArticleCategory } from "@/lib/learning-center";

/** Reader-facing article export payload (Learning Center download). */
export interface ArticleDownloadSource {
  title: string;
  slug: string;
  excerpt: string;
  category: ArticleCategory;
  bodyMd: string;
  featuredImage?: string;
  publishedAt?: string | null;
  lastUpdated?: string | null;
}
