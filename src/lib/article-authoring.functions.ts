import { execFileSync } from "child_process";
import { createServerFn } from "@tanstack/react-start";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  buildFeaturedImagePrompt,
  featuredImagePublicPath,
  serializeArticleMarkdown,
  type ArticleDraft,
} from "@/lib/article-authoring";
import type { ArticleCategory } from "@/lib/learning-center";
import { getRuntimeSecret, isLocalDevEnvironment } from "@/lib/env";
import {
  getArticleTopicDraft,
  getMedicareComplaintResearch,
} from "@/lib/medicare-complaint-topics";

async function verifyAdmin(userId: string) {
  const { data } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  const allowed = (data ?? []).some((r) => r.role === "admin" || r.role === "leads_admin");
  if (!allowed) throw new Error("Admin access required");
}

function canAutoGenerateArticleImages(): boolean {
  return (
    getRuntimeSecret("ARTICLE_IMAGE_GENERATION") === "auto" &&
    Boolean(getRuntimeSecret("OPENAI_API_KEY"))
  );
}

const draftSchema = z.object({
  title: z.string().min(8).max(200),
  slug: z.string().min(3).max(80),
  excerpt: z.string().min(20).max(400),
  category: z.enum([
    "plan-types",
    "enrollment",
    "costs",
    "comparing-plans",
    "staying-informed",
  ]),
  metaDescription: z.string().min(40).max(160),
  featuredImage: z.string().optional(),
  featured: z.boolean(),
  published: z.boolean(),
  sortOrder: z.number().int().min(0).max(9999),
  publishedAt: z.string(),
  bodyMd: z.string().min(80).max(50000),
});

export const getArticleAuthoringCapabilities = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyAdmin(context.userId);
    return {
      imageGeneration: canAutoGenerateArticleImages() ? ("auto" as const) : ("prompt-only" as const),
      canWriteToDisk: isLocalDevEnvironment(),
    };
  });

export const researchMedicareComplaintsAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyAdmin(context.userId);
    return getMedicareComplaintResearch();
  });

export const loadArticleTopicAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ topicId: z.string().min(3) }).parse(input))
  .handler(async ({ context, data }) => {
    await verifyAdmin(context.userId);
    const draft = getArticleTopicDraft(data.topicId);
    if (!draft) throw new Error("Topic not found");
    return draft;
  });

export const resolveFeaturedImageAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        title: z.string().min(8),
        excerpt: z.string().min(20),
        category: draftSchema.shape.category,
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await verifyAdmin(context.userId);
    const prompt = buildFeaturedImagePrompt(data as Pick<ArticleDraft, "title" | "excerpt" | "category">);

    if (!canAutoGenerateArticleImages()) {
      return { mode: "prompt" as const, prompt };
    }

    const apiKey = getRuntimeSecret("OPENAI_API_KEY");
    if (!apiKey) {
      return { mode: "prompt" as const, prompt };
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        size: "1792x1024",
        response_format: "b64_json",
        n: 1,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Image generation failed (${response.status}). ${detail.slice(0, 200)}`);
    }

    const json = (await response.json()) as { data?: Array<{ b64_json?: string }> };
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) throw new Error("Image generation returned no data");

    return {
      mode: "generated" as const,
      prompt,
      dataUrl: `data:image/png;base64,${b64}`,
      mimeType: "image/png",
    };
  });

export const saveArticleFilesAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        draft: draftSchema,
        imageBase64: z.string().optional(),
        imageMimeType: z.string().optional(),
        imageExtension: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await verifyAdmin(context.userId);
    if (!isLocalDevEnvironment()) {
      throw new Error("Saving directly to disk is only available in local development.");
    }

    const ext = (data.imageExtension ?? "webp").replace(/^\./, "").toLowerCase();
    const defaultFeaturedPath = featuredImagePublicPath(data.draft.slug, "png");
    const featuredPath =
      data.imageBase64 && data.imageMimeType
        ? featuredImagePublicPath(data.draft.slug, ext)
        : data.draft.featuredImage?.trim() || defaultFeaturedPath;

    const draft: ArticleDraft = {
      ...(data.draft as ArticleDraft),
      category: data.draft.category as ArticleCategory,
      featuredImage: featuredPath,
    };

    const root = process.cwd();
    const articlesDir = join(root, "articles");
    const imagesDir = join(root, "public", "learning-center");
    mkdirSync(articlesDir, { recursive: true });
    mkdirSync(imagesDir, { recursive: true });

    writeFileSync(join(articlesDir, `${draft.slug}.md`), serializeArticleMarkdown(draft), "utf8");

    if (data.imageBase64 && data.imageMimeType) {
      writeFileSync(
        join(imagesDir, `${draft.slug}.${ext}`),
        Buffer.from(data.imageBase64, "base64"),
      );
    } else if (!data.imageBase64) {
      execFileSync(process.execPath, ["scripts/generate-learning-center-images.mjs", draft.slug], {
        cwd: root,
        stdio: "pipe",
      });
    }

    return {
      ok: true as const,
      markdownPath: `articles/${draft.slug}.md`,
      imagePath: `public/learning-center/${draft.slug}.jpg`,
    };
  });
