/** GYSH Content Factory — generator + D1 persistence (no client seed drafts). */

import { api } from "./api";

export type ContentAssetType =
  | "youtube_script"
  | "facebook_post"
  | "newsletter"
  | "kids_activity"
  | "adult_guide"
  | "image_prompt";

export type ContentDraftStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "scheduled"
  | "published"
  | "rejected";

export const CONTENT_TYPE_LABELS: Record<ContentAssetType, string> = {
  youtube_script: "YouTube / Kevina Script",
  facebook_post: "Facebook Post",
  newsletter: "Newsletter",
  kids_activity: "Kids Activity",
  adult_guide: "Adult Guide Blurb",
  image_prompt: "Image Prompt",
};

export const CONTENT_STATUS_LABELS: Record<ContentDraftStatus, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
  rejected: "Rejected",
};

export type ContentDraft = {
  id: string;
  batchId: string;
  type: ContentAssetType;
  title: string;
  excerpt: string;
  body: string;
  audience: "kid" | "junior" | "adult" | "all";
  status: ContentDraftStatus;
  owner: "Tina" | "Evelyn" | "Both";
  createdAt: string;
};

export type ContentBatch = {
  id: string;
  name: string;
  topic: string;
  createdAt: string;
  draftIds: string[];
};

export async function fetchContentState(): Promise<{ batches: ContentBatch[]; drafts: ContentDraft[] }> {
  const data = await api<{ batches: ContentBatch[]; drafts: ContentDraft[] }>("content");
  return {
    batches: data.batches ?? [],
    drafts: data.drafts ?? [],
  };
}

export async function persistContentState(
  batches: ContentBatch[],
  drafts: ContentDraft[],
): Promise<{ batches: ContentBatch[]; drafts: ContentDraft[] }> {
  const data = await api<{ batches: ContentBatch[]; drafts: ContentDraft[] }>("content", {
    method: "PUT",
    body: { batches, drafts },
  });
  return {
    batches: data.batches ?? [],
    drafts: data.drafts ?? [],
  };
}

export function generateWeeklyBatch(
  topic: string,
  existing: { batches: ContentBatch[]; drafts: ContentDraft[] },
): { batches: ContentBatch[]; drafts: ContentDraft[] } {
  const batchId = `BATCH-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const templates: Omit<ContentDraft, "id" | "batchId" | "createdAt">[] = [
    {
      type: "youtube_script",
      title: `${topic} — Kevina story script`,
      excerpt: "Bedtime adventure with Glow Getter lesson",
      body: `Topic: ${topic}\n\nHook:\nStory:\nGlow Getter pledge:\nCTA: Subscribe + Kids Side Hustle Corner`,
      audience: "kid",
      status: "draft",
      owner: "Tina",
    },
    {
      type: "kids_activity",
      title: `${topic} — post-story activity card`,
      excerpt: "Printable / on-site activity after watching",
      body: `After watching, kids will…\nMaterials:\nParent tip:`,
      audience: "kid",
      status: "draft",
      owner: "Tina",
    },
    {
      type: "facebook_post",
      title: `${topic} — Facebook community post`,
      excerpt: "Engagement post for GYSH FB page",
      body: `Hey GYSH family — ${topic}. Tell us your glow moment in the comments!`,
      audience: "all",
      status: "draft",
      owner: "Tina",
    },
    {
      type: "facebook_post",
      title: `${topic} — Adult Side Hustle FB tip`,
      excerpt: "Adult-facing tip from Evelyn lane",
      body: `Adult Side Hustlers: ${topic}. Open Get Your Side Hustle on GetYourSideHustle.com to see your fit.`,
      audience: "adult",
      status: "draft",
      owner: "Evelyn",
    },
    {
      type: "adult_guide",
      title: `${topic} — calculator callout`,
      excerpt: "Drive traffic to profit estimators",
      body: `Why this matters:\nWhich calculator to use:\nCTA:`,
      audience: "adult",
      status: "draft",
      owner: "Evelyn",
    },
    {
      type: "newsletter",
      title: `${topic} — weekly newsletter draft`,
      excerpt: "Kids + adult dual sections",
      body: `Subject: ${topic}\nKids block:\nAdult block:\nFooter CTA:`,
      audience: "all",
      status: "draft",
      owner: "Both",
    },
    {
      type: "image_prompt",
      title: `${topic} — Canva / social image prompt`,
      excerpt: "Antique Gold + Soft Ivory brand frame",
      body: `Create a Soft Ivory background with Antique Gold accents and Crimson CTA button. Subject: ${topic}. Luxury, warm, family-friendly.`,
      audience: "all",
      status: "draft",
      owner: "Both",
    },
  ];

  const newDrafts = templates.map((t, i) => ({
    ...t,
    id: `D-${Date.now()}-${i}`,
    batchId,
    createdAt,
  }));

  const batch: ContentBatch = {
    id: batchId,
    name: `Weekly — ${topic}`,
    topic,
    createdAt,
    draftIds: newDrafts.map((d) => d.id),
  };

  return {
    batches: [batch, ...existing.batches],
    drafts: [...newDrafts, ...existing.drafts],
  };
}
