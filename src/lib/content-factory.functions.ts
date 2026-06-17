import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  CONTENT_ASSET_TYPES,
  CONTENT_DRAFT_STATUSES,
  type ContentDraftFilters,
} from "@/lib/content-factory/types";
import {
  createWeeklyContentBatch,
  getContentBatch,
  getContentDraft,
  listContentBatches,
  listContentDrafts,
  publishContentDraft,
  updateContentDraft,
  updateContentDraftStatus,
} from "@/lib/content-factory/repository";

async function verifyContentFactoryAdmin(userId: string) {
  const { data } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  const allowed = (data ?? []).some((r) => r.role === "admin" || r.role === "leads_admin");
  if (!allowed) throw new Error("Admin access required");
}

const draftFiltersSchema = z.object({
  batchId: z.string().uuid().optional(),
  type: z.enum(["all", ...CONTENT_ASSET_TYPES]).optional(),
  status: z.enum(["all", ...CONTENT_DRAFT_STATUSES]).optional(),
});

export const listContentFactoryBatchesAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ limit: z.number().int().min(1).max(50).optional() }).parse(input ?? {}))
  .handler(async ({ context, data }) => {
    await verifyContentFactoryAdmin(context.userId);
    return listContentBatches(data.limit ?? 20);
  });

export const getContentFactoryBatchAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ batchId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await verifyContentFactoryAdmin(context.userId);
    const batch = await getContentBatch(data.batchId);
    if (!batch) throw new Error("Batch not found");
    return batch;
  });

export const listContentFactoryDraftsAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => draftFiltersSchema.parse(input ?? {}))
  .handler(async ({ context, data }) => {
    await verifyContentFactoryAdmin(context.userId);
    const filters: ContentDraftFilters = {
      batchId: data.batchId,
      type: data.type,
      status: data.status,
    };
    return listContentDrafts(filters);
  });

export const getContentFactoryDraftAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ draftId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await verifyContentFactoryAdmin(context.userId);
    const draft = await getContentDraft(data.draftId);
    if (!draft) throw new Error("Draft not found");
    return draft;
  });

export const generateWeeklyContentBatchAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ topic: z.string().min(3).max(200).optional() }).parse(input ?? {}),
  )
  .handler(async ({ context, data }) => {
    await verifyContentFactoryAdmin(context.userId);
    return createWeeklyContentBatch(context.userId, data.topic);
  });

export const updateContentFactoryDraftAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        draftId: z.string().uuid(),
        title: z.string().min(3).max(200),
        excerpt: z.string().min(10).max(400),
        body: z.string().min(20).max(50000),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await verifyContentFactoryAdmin(context.userId);
    return updateContentDraft(data.draftId, context.userId, {
      title: data.title,
      excerpt: data.excerpt,
      body: data.body,
    });
  });

export const updateContentFactoryDraftStatusAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        draftId: z.string().uuid(),
        status: z.enum(CONTENT_DRAFT_STATUSES),
        rejectionReason: z.string().max(500).optional(),
        scheduledFor: z.string().datetime().nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await verifyContentFactoryAdmin(context.userId);
    return updateContentDraftStatus(data.draftId, context.userId, data.status, {
      rejectionReason: data.rejectionReason,
      scheduledFor: data.scheduledFor,
    });
  });

export const publishContentFactoryDraftAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ draftId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await verifyContentFactoryAdmin(context.userId);
    return publishContentDraft(data.draftId, context.userId);
  });
