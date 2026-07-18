import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { generateWeeklyBatchAssets } from "@/lib/content-factory/batch-seed";
import { slugifyArticleTitle } from "@/lib/article-authoring";
import {
  buildWeeklyBatchName,
  countAssetsByType,
  emptyAssetCounts,
  type ContentBatch,
  type ContentBatchAssetCounts,
  type ContentDraft,
  type ContentDraftFilters,
  type ContentDraftSnapshot,
  type ContentDraftStatus,
  type ContentAssetType,
} from "@/lib/content-factory/types";
import { logContentDispatchEvent } from "@/lib/content-factory/dispatch-log";
import { buildWorkbookFacebookPostTemplates } from "@/lib/content-factory/workbook-facebook-post-templates";
import { normalizeLegacyBrandJson, normalizeLegacyBrandText } from "@/lib/site-brand";
import { hashContentBody } from "@/lib/content-factory/newsletter-dispatch";
import {
  assertDraftStatusTransition,
  validateDraftEdit,
  validateDraftPublish,
} from "@/lib/content-factory/workflow";

type BatchRow = {
  id: string;
  name: string;
  topic: string;
  batch_kind: string;
  status: string;
  asset_counts: ContentBatchAssetCounts | null;
  created_by: string | null;
  created_at: string;
  completed_at: string | null;
};

type DraftRow = {
  id: string;
  batch_id: string | null;
  type: string;
  slot_index: number;
  title: string;
  excerpt: string;
  body: string;
  payload: Record<string, unknown> | null;
  status: string;
  scheduled_for: string | null;
  published_at: string | null;
  published_ref: string | null;
  rejection_reason: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

function mapBatch(row: BatchRow): ContentBatch {
  return {
    id: row.id,
    name: row.name,
    topic: row.topic,
    batchKind: row.batch_kind as ContentBatch["batchKind"],
    status: row.status as ContentBatch["status"],
    assetCounts: row.asset_counts ?? emptyAssetCounts(),
    createdBy: row.created_by,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

function mapDraft(row: DraftRow): ContentDraft {
  return {
    id: row.id,
    batchId: row.batch_id,
    type: row.type as ContentAssetType,
    slotIndex: row.slot_index,
    title: normalizeLegacyBrandText(row.title),
    excerpt: normalizeLegacyBrandText(row.excerpt),
    body: normalizeLegacyBrandText(row.body),
    payload: (normalizeLegacyBrandJson(row.payload ?? {}) ?? {}) as Record<string, unknown>,
    status: row.status as ContentDraftStatus,
    scheduledFor: row.scheduled_for,
    publishedAt: row.published_at,
    publishedRef: row.published_ref,
    rejectionReason: row.rejection_reason,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function insertDraftVersion(
  draftId: string,
  snapshot: ContentDraftSnapshot,
  userId: string,
): Promise<void> {
  await supabaseAdmin.from("content_draft_versions" as any).insert({
    draft_id: draftId,
    snapshot,
    created_by: userId,
  });
}

export async function listContentBatches(limit = 20): Promise<ContentBatch[]> {
  const { data, error } = await supabaseAdmin
    .from("content_batches" as any)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data as any as BatchRow[]).map(mapBatch);
}

export async function getContentBatch(batchId: string): Promise<ContentBatch | null> {
  const { data, error } = await supabaseAdmin
    .from("content_batches" as any)
    .select("*")
    .eq("id", batchId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapBatch(data as any as BatchRow) : null;
}

export async function listContentDrafts(filters: ContentDraftFilters = {}): Promise<ContentDraft[]> {
  let query = supabaseAdmin.from("content_drafts" as any).select("*").order("created_at", { ascending: false });

  if (filters.batchId) query = query.eq("batch_id", filters.batchId);
  if (filters.type && filters.type !== "all") query = query.eq("type", filters.type);
  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as any as DraftRow[]).map(mapDraft);
}

export async function getContentDraft(draftId: string): Promise<ContentDraft | null> {
  const { data, error } = await supabaseAdmin
    .from("content_drafts" as any)
    .select("*")
    .eq("id", draftId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapDraft(data as any as DraftRow) : null;
}

export async function createWeeklyContentBatch(
  userId: string,
  topic = "Medicare education weekly themes",
): Promise<{ batch: ContentBatch; drafts: ContentDraft[] }> {
  const batchName = buildWeeklyBatchName();
  const { data: batchRow, error: batchError } = await supabaseAdmin
    .from("content_batches" as any)
    .insert({
      name: batchName,
      topic,
      batch_kind: "weekly",
      status: "generating",
      asset_counts: emptyAssetCounts(),
      created_by: userId,
    })
    .select("*")
    .single();

  if (batchError || !batchRow) throw new Error(batchError?.message ?? "Could not create content batch");

  const batch = mapBatch(batchRow as any as BatchRow);
  const generated = generateWeeklyBatchAssets(topic, batch.id);

  const draftRows = generated.map((asset) => ({
    batch_id: batch.id,
    type: asset.type,
    slot_index: asset.slotIndex,
    title: asset.title,
    excerpt: asset.excerpt,
    body: asset.body,
    payload: asset.payload ?? {},
    status: "draft",
    created_by: userId,
    updated_by: userId,
  }));

  const { data: insertedDrafts, error: draftError } = await supabaseAdmin
    .from("content_drafts" as any)
    .insert(draftRows)
    .select("*");

  if (draftError || !insertedDrafts) {
    await supabaseAdmin
      .from("content_batches" as any)
      .update({ status: "failed" })
      .eq("id", batch.id);
    throw new Error(draftError?.message ?? "Could not create draft queue items");
  }

  const drafts = (insertedDrafts as any as DraftRow[]).map(mapDraft);
  const assetCounts = countAssetsByType(drafts);

  const { data: completedBatch, error: completeError } = await supabaseAdmin
    .from("content_batches" as any)
    .update({
      status: "ready",
      asset_counts: assetCounts,
      completed_at: new Date().toISOString(),
    })
    .eq("id", batch.id)
    .select("*")
    .single();

  if (completeError || !completedBatch) throw new Error(completeError?.message ?? "Could not finalize batch");

  return { batch: mapBatch(completedBatch as any as BatchRow), drafts };
}

export async function updateContentDraft(
  draftId: string,
  userId: string,
  input: { title: string; excerpt: string; body: string },
): Promise<ContentDraft> {
  const existing = await getContentDraft(draftId);
  if (!existing) throw new Error("Draft not found");
  validateDraftEdit(existing.status);

  const snapshot: ContentDraftSnapshot = {
    title: existing.title,
    excerpt: existing.excerpt,
    body: existing.body,
    payload: existing.payload,
    status: existing.status,
  };

  const { data, error } = await supabaseAdmin
    .from("content_drafts" as any)
    .update({
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", draftId)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Could not update draft");
  await insertDraftVersion(draftId, snapshot, userId);
  return mapDraft(data as any as DraftRow);
}

export async function patchContentDraftPayload(
  draftId: string,
  userId: string,
  payloadPatch: Record<string, unknown>,
): Promise<ContentDraft> {
  const existing = await getContentDraft(draftId);
  if (!existing) throw new Error("Draft not found");

  const snapshot: ContentDraftSnapshot = {
    title: existing.title,
    excerpt: existing.excerpt,
    body: existing.body,
    payload: existing.payload,
    status: existing.status,
  };

  const payload = { ...existing.payload, ...payloadPatch };

  const { data, error } = await supabaseAdmin
    .from("content_drafts" as any)
    .update({
      payload,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", draftId)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Could not update draft payload");
  await insertDraftVersion(draftId, snapshot, userId);
  return mapDraft(data as any as DraftRow);
}

export async function updateContentDraftStatus(
  draftId: string,
  userId: string,
  nextStatus: ContentDraftStatus,
  options?: { rejectionReason?: string; scheduledFor?: string | null },
): Promise<ContentDraft> {
  const existing = await getContentDraft(draftId);
  if (!existing) throw new Error("Draft not found");
  assertDraftStatusTransition(existing.status, nextStatus);

  const patch: Record<string, unknown> = {
    status: nextStatus,
    updated_by: userId,
    updated_at: new Date().toISOString(),
  };

  if (nextStatus === "rejected") {
    patch.rejection_reason = options?.rejectionReason?.trim() || "Rejected in content review";
  }
  if (nextStatus === "scheduled") {
    patch.scheduled_for = options?.scheduledFor ?? new Date().toISOString();
  } else if (existing.status === "scheduled") {
    patch.scheduled_for = null;
  }

  if (nextStatus === "published") {
    validateDraftPublish(existing.status);
    patch.published_at = new Date().toISOString();
    if (existing.type === "article") {
      const slug =
        typeof existing.payload.suggestedSlug === "string"
          ? existing.payload.suggestedSlug
          : slugifyArticleTitle(existing.title);
      patch.published_ref = `/learning-center/${slug}`;
    } else {
      patch.published_ref = `content-factory/${existing.type}/${existing.id}`;
    }
  } else if (existing.status === "published") {
    patch.published_at = null;
    patch.published_ref = null;
  }

  if (nextStatus !== "rejected" && existing.status === "rejected") {
    patch.rejection_reason = null;
  }

  const { data, error } = await supabaseAdmin
    .from("content_drafts" as any)
    .update(patch)
    .eq("id", draftId)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Could not update draft status");
  const updated = mapDraft(data as any as DraftRow);

  if (nextStatus === "scheduled") {
    const channel =
      existing.type === "newsletter" ||
      existing.type === "facebook_post" ||
      existing.type === "article" ||
      existing.type === "lead_magnet"
        ? existing.type
        : "broadcast";
    await logContentDispatchEvent({
      channel,
      dispatchKind: "scheduled",
      draftId: updated.id,
      batchId: updated.batchId,
      subject: updated.title,
      templateLabel: `content-factory/${existing.type}`,
      bodyPreview: updated.body.replace(/\s+/g, " ").trim().slice(0, 240),
      bodyHash: hashContentBody(updated.body),
      sentBy: userId,
      metadata: { scheduled_for: updated.scheduledFor },
    });
  }

  return updated;
}

export async function publishContentDraft(draftId: string, userId: string): Promise<ContentDraft> {
  return updateContentDraftStatus(draftId, userId, "published");
}

/** Upsert workbook Facebook posts (slots 3 + 7) from current templates. */
export async function syncWorkbookFacebookPosts(
  batchId: string,
  userId: string,
): Promise<{ updatedSlots: number[]; insertedSlots: number[] }> {
  const drafts = await listContentDrafts({ batchId, type: "facebook_post" });
  const updatedSlots: number[] = [];
  const insertedSlots: number[] = [];

  for (const template of buildWorkbookFacebookPostTemplates()) {
    const existing = drafts.find((d) => d.slotIndex === template.slotIndex);
    if (existing) {
      await updateContentDraft(existing.id, userId, {
        title: template.title,
        excerpt: template.excerpt,
        body: template.body,
      });
      await patchContentDraftPayload(existing.id, userId, {
        provider: "seed",
        platform: "facebook",
        slot: template.slotIndex + 1,
        audience: template.audience,
      });
      updatedSlots.push(template.slotIndex);
      continue;
    }

    const { error } = await supabaseAdmin.from("content_drafts" as any).insert({
      batch_id: batchId,
      type: "facebook_post",
      slot_index: template.slotIndex,
      title: template.title,
      excerpt: template.excerpt,
      body: template.body,
      payload: {
        provider: "seed",
        platform: "facebook",
        slot: template.slotIndex + 1,
        audience: template.audience,
      },
      status: "draft",
      created_by: userId,
      updated_by: userId,
    });

    if (error) throw new Error(error.message ?? `Could not insert Facebook post slot ${template.slotIndex}`);
    insertedSlots.push(template.slotIndex);
  }

  const allDrafts = await listContentDrafts({ batchId });
  await supabaseAdmin
    .from("content_batches" as any)
    .update({
      asset_counts: countAssetsByType(allDrafts),
      updated_at: new Date().toISOString(),
    })
    .eq("id", batchId);

  return { updatedSlots, insertedSlots };
}
