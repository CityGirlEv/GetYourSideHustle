export type ContentAssetType =
  | "article"
  | "facebook_post"
  | "newsletter"
  | "faq"
  | "lead_magnet"
  | "image_prompt";

export type ContentDraftStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "scheduled"
  | "published"
  | "rejected";

export type ContentBatchStatus = "generating" | "ready" | "failed";

export type ContentBatchKind = "weekly" | "manual";

/** Future AI providers — wire OpenAI, Anthropic, or Gemini here. */
export type ContentAiProvider = "seed" | "openai" | "anthropic" | "gemini";

export interface ContentBatchAssetCounts {
  article: number;
  facebook_post: number;
  newsletter: number;
  faq: number;
  lead_magnet: number;
  image_prompt: number;
  total: number;
}

export interface ContentBatch {
  id: string;
  name: string;
  topic: string;
  batchKind: ContentBatchKind;
  status: ContentBatchStatus;
  assetCounts: ContentBatchAssetCounts;
  createdBy: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface ContentDraft {
  id: string;
  batchId: string | null;
  type: ContentAssetType;
  slotIndex: number;
  title: string;
  excerpt: string;
  body: string;
  payload: Record<string, any>;
  status: ContentDraftStatus;
  scheduledFor: string | null;
  publishedAt: string | null;
  publishedRef: string | null;
  rejectionReason: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContentDraftSnapshot {
  title: string;
  excerpt: string;
  body: string;
  payload: Record<string, any>;
  status: ContentDraftStatus;
}

export interface ContentDraftFilters {
  batchId?: string;
  type?: ContentAssetType | "all";
  status?: ContentDraftStatus | "all";
}

export const CONTENT_DRAFT_STATUSES: ContentDraftStatus[] = [
  "draft",
  "pending_review",
  "approved",
  "scheduled",
  "published",
  "rejected",
];

export const CONTENT_ASSET_TYPES: ContentAssetType[] = [
  "article",
  "facebook_post",
  "newsletter",
  "faq",
  "lead_magnet",
  "image_prompt",
];

export const CONTENT_STATUS_LABELS: Record<ContentDraftStatus, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
  rejected: "Rejected",
};

export const CONTENT_TYPE_LABELS: Record<ContentAssetType, string> = {
  article: "Learning Center Article",
  facebook_post: "Facebook Post",
  newsletter: "Newsletter",
  faq: "FAQ Collection",
  lead_magnet: "Lead Magnet",
  image_prompt: "Image Prompt",
};

export interface WeeklyBatchSlot {
  type: ContentAssetType;
  count: number;
  label: string;
}

export const WEEKLY_CONTENT_BATCH_PLAN: WeeklyBatchSlot[] = [
  { type: "article", count: 3, label: "Learning Center Articles" },
  { type: "facebook_post", count: 7, label: "Facebook Posts" },
  { type: "newsletter", count: 1, label: "Newsletter" },
  { type: "lead_magnet", count: 1, label: "Lead Magnet" },
  { type: "faq", count: 1, label: "FAQ Collection" },
  { type: "image_prompt", count: 5, label: "Image Prompts" },
];

export function weeklyBatchAssetTotal(): number {
  return WEEKLY_CONTENT_BATCH_PLAN.reduce((sum, slot) => sum + slot.count, 0);
}

export function buildWeeklyBatchName(date = new Date()): string {
  return `Weekly Content — ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

export function emptyAssetCounts(): ContentBatchAssetCounts {
  return {
    article: 0,
    facebook_post: 0,
    newsletter: 0,
    faq: 0,
    lead_magnet: 0,
    image_prompt: 0,
    total: 0,
  };
}

export function countAssetsByType(drafts: Pick<ContentDraft, "type">[]): ContentBatchAssetCounts {
  const counts = emptyAssetCounts();
  for (const draft of drafts) {
    counts[draft.type] += 1;
  }
  counts.total = drafts.length;
  return counts;
}
