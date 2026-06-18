import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { listPublishedArticles } from "@/lib/articles";
import { publicSiteUrl } from "@/lib/site-url";
import {
  listContentDispatchLog,
  listContentDraftVersions,
  logContentDispatchEvent,
} from "@/lib/content-factory/dispatch-log";
import { sendNewsletterEmail, hashContentBody } from "@/lib/content-factory/newsletter-dispatch";
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
    const draft = await publishContentDraft(data.draftId, context.userId);
    const channel =
      draft.type === "newsletter" ||
      draft.type === "facebook_post" ||
      draft.type === "article" ||
      draft.type === "lead_magnet"
        ? draft.type
        : "broadcast";
    await logContentDispatchEvent({
      channel,
      dispatchKind: "publish",
      draftId: draft.id,
      batchId: draft.batchId,
      subject: draft.title,
      templateLabel: `content-factory/${draft.type}`,
      bodyPreview: draft.body.replace(/\s+/g, " ").trim().slice(0, 240),
      bodyHash: hashContentBody(draft.body),
      sentBy: context.userId,
      metadata: { published_ref: draft.publishedRef },
    });
    return draft;
  });

export const sendContentFactoryNewsletterTestAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        draftId: z.string().uuid(),
        recipient: z.string().email().max(320),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await verifyContentFactoryAdmin(context.userId);
    const draft = await getContentDraft(data.draftId);
    if (!draft) throw new Error("Draft not found");
    if (draft.type !== "newsletter") throw new Error("Only newsletter drafts support Send Test");

    return sendNewsletterEmail({
      recipient: data.recipient,
      subject: draft.title,
      body: draft.body,
      templateLabel: "content-factory-newsletter",
      userId: context.userId,
      draftId: draft.id,
      batchId: draft.batchId,
      dispatchKind: "test",
      requestUrl: getRequest()?.url,
    });
  });

export const sendNewsletterCenterTestAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        recipient: z.string().email().max(320),
        subject: z.string().min(3).max(500),
        body: z.string().min(20).max(50_000),
        featuredSlugs: z.array(z.string().min(1).max(120)).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await verifyContentFactoryAdmin(context.userId);
    const site = publicSiteUrl();
    const featuredArticles =
      data.featuredSlugs?.map((slug) => listPublishedArticles().find((article) => article.slug === slug)).filter(
        (article): article is NonNullable<typeof article> => Boolean(article),
      ).map((article) => ({
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        featuredImage: article.featuredImage,
      })) ?? [];

    return sendNewsletterEmail({
      recipient: data.recipient,
      subject: data.subject,
      body: data.body,
      templateLabel: "newsletter-center",
      userId: context.userId,
      dispatchKind: "test",
      requestUrl: getRequest()?.url,
      featuredArticles,
      siteUrl: site,
    });
  });

export const listContentDispatchLogAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        limit: z.number().int().min(1).max(200).optional(),
        channel: z.enum(["newsletter", "facebook_post", "article", "lead_magnet", "broadcast"]).optional(),
        draftId: z.string().uuid().optional(),
        batchId: z.string().uuid().optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ context, data }) => {
    await verifyContentFactoryAdmin(context.userId);
    return listContentDispatchLog({
      limit: data.limit ?? 50,
      channel: data.channel,
      draftId: data.draftId,
      batchId: data.batchId,
    });
  });

export const listContentDraftVersionsAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ draftId: z.string().uuid(), limit: z.number().int().min(1).max(50).optional() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await verifyContentFactoryAdmin(context.userId);
    return listContentDraftVersions(data.draftId, data.limit ?? 20);
  });

export const listNewsletterArticlesAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyContentFactoryAdmin(context.userId);
    return listPublishedArticles().map((article) => ({
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      featuredImage: article.featuredImage,
    }));
  });
