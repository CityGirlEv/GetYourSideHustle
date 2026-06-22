import { featuredImagePathForSlug } from "@/lib/learning-center-image-prompts";
import { canonicalUrl } from "@/lib/site-url";
import type { ContentAssetType, ContentDraft } from "@/lib/content-factory/types";
import type { EditorialCalendarEvent } from "@/lib/content-factory/weekly-editorial-schedule";
import { facebookPostAdminSearch } from "@/lib/content-factory/facebook-post-copy";
import { leadMagnetPdfHrefIfSaved } from "@/lib/content-factory/lead-magnet-paths";

export type CalendarDraftRef = Pick<
  ContentDraft,
  "id" | "status" | "title" | "excerpt" | "body" | "payload" | "publishedRef" | "type" | "slotIndex"
>;

export interface CalendarResourceLink {
  label: string;
  /** Omit href for labels-only rows (e.g. hero not uploaded yet). */
  href?: string;
  external?: boolean;
  description?: string;
}

export interface FacebookPostImageGuidance {
  headline: string;
  imageLabel: string;
  imageUrl: string | null;
  source: "article-hero" | "brand" | "optional-prompt";
  steps: string[];
}

export function contentFactoryAdminSearch(
  batchId: string | null | undefined,
  type: ContentAssetType,
  slotIndex: number,
): { batchId?: string; type: ContentAssetType; slot: number } {
  return batchId ? { batchId, type, slot: slotIndex } : { type, slot: slotIndex };
}

export function draftSlotKey(type: ContentAssetType, slotIndex: number): string {
  return `${type}:${slotIndex}`;
}

export function slugFromDraft(draft: CalendarDraftRef | undefined): string | null {
  if (!draft) return null;
  const fromPayload = draft.payload?.suggestedSlug;
  if (typeof fromPayload === "string" && fromPayload.trim()) {
    return fromPayload.trim();
  }
  if (draft.publishedRef?.includes("/learning-center/")) {
    const segment = draft.publishedRef.split("/learning-center/")[1]?.split(/[?#]/)[0];
    if (segment?.trim()) return segment.trim();
  }
  return null;
}

export function learningCenterArticleUrl(slug: string): string {
  return canonicalUrl(`/learning-center/${slug}`);
}

export function featuredImageUrlForSlug(slug: string): string {
  return canonicalUrl(featuredImagePathForSlug(slug));
}

/** Facebook posts 1–3 (slots 0–2) promote the matching weekly article. */
export function facebookPostPairedArticleSlot(fbSlotIndex: number): number | null {
  if (fbSlotIndex >= 0 && fbSlotIndex <= 2) return fbSlotIndex;
  return null;
}

/** Image prompts 0–2 pair with articles 0–2 for hero images. */
export function imagePromptPairedArticleSlot(imageSlotIndex: number): number | null {
  if (imageSlotIndex >= 0 && imageSlotIndex <= 2) return imageSlotIndex;
  return null;
}

export function getDraftFromMap(
  draftBySlot: Map<string, CalendarDraftRef>,
  type: ContentAssetType,
  slotIndex: number,
): CalendarDraftRef | undefined {
  return draftBySlot.get(draftSlotKey(type, slotIndex));
}

/** Full TPMO-safe prompt text stored on the image_prompt draft body. */
export function imagePromptTextFromDraft(draft: CalendarDraftRef | undefined): string {
  return draft?.body?.trim() ?? "";
}

/** Slug for the hero JPG — draft payload first, then paired weekly article. */
export function resolveHeroSlugForImagePrompt(
  imagePromptDraft: CalendarDraftRef | undefined,
  draftBySlot: Map<string, CalendarDraftRef>,
  slotIndex: number,
): string | null {
  const fromPrompt = slugFromDraft(imagePromptDraft);
  if (fromPrompt) return fromPrompt;
  const paired = imagePromptPairedArticleSlot(slotIndex);
  if (paired === null) return null;
  return slugFromDraft(getDraftFromMap(draftBySlot, "article", paired));
}

export function heroUploadPathFromPayload(
  payload: Record<string, unknown> | undefined,
): string | null {
  const path = payload?.heroImagePath;
  return typeof path === "string" && path.trim() ? path.trim() : null;
}

export function heroUploadedAtFromPayload(
  payload: Record<string, unknown> | undefined,
): string | null {
  const at = payload?.heroUploadedAt;
  return typeof at === "string" && at.trim() ? at.trim() : null;
}

/** Same-origin hero URL — only when uploaded via the calendar (avoids 404 on production before deploy). */
export function heroImageHrefIfUploaded(
  slug: string,
  imagePromptDraft: CalendarDraftRef | undefined,
): string | null {
  const uploadedAt = heroUploadedAtFromPayload(imagePromptDraft?.payload);
  if (!uploadedAt) return null;
  const heroPath =
    heroUploadPathFromPayload(imagePromptDraft?.payload) ?? featuredImagePathForSlug(slug);
  return `${heroPath}?v=${encodeURIComponent(uploadedAt)}`;
}

export function heroImageTargetPath(slug: string, imagePromptDraft?: CalendarDraftRef): string {
  return heroUploadPathFromPayload(imagePromptDraft?.payload) ?? featuredImagePathForSlug(slug);
}

export function contentFactoryDraftHref(
  batchId: string | null,
  type: ContentAssetType,
  slotIndex: number,
): string {
  return `/admin/content-factory?${new URLSearchParams({
    ...(batchId ? { batchId } : {}),
    type,
    slot: String(slotIndex),
  }).toString()}`;
}

export function facebookPostImageGuidance(
  fbSlotIndex: number,
  draftBySlot: Map<string, CalendarDraftRef>,
): FacebookPostImageGuidance {
  const articleSlot = facebookPostPairedArticleSlot(fbSlotIndex);
  if (articleSlot !== null) {
    const articleDraft = getDraftFromMap(draftBySlot, "article", articleSlot);
    const slug = slugFromDraft(articleDraft);
    const imagePromptDraft = getDraftFromMap(draftBySlot, "image_prompt", articleSlot);
    const imageUrl = slug ? heroImageHrefIfUploaded(slug, imagePromptDraft) : null;

    return {
      headline: "Use the same hero image as the linked Learning Center article.",
      imageLabel: slug
        ? `${slug}.jpg`
        : `Article ${articleSlot + 1} hero image (generate from Image Prompt ${articleSlot + 1})`,
      imageUrl,
      source: "article-hero",
      steps: [
        imagePromptDraft
          ? `Open Image Prompt ${articleSlot + 1} in Content Factory and generate the hero photo.`
          : `Generate the hero image for Article ${articleSlot + 1} before posting.`,
        slug
          ? `Save the JPG as public/learning-center/${slug}.jpg (or use Admin → Create Articles).`
          : "Save the JPG under public/learning-center/ using the article slug.",
        "In Facebook, click Add photo and upload that hero image — do not post text-only for article promos.",
        "Paste the post copy from this page. If the post includes an article URL, Facebook may also show a link preview underneath.",
      ],
    };
  }

  return {
    headline: "No linked article — attach a brand or educational photo.",
    imageLabel: "email-header-logo.png (brand fallback)",
    imageUrl: canonicalUrl("/email-header-logo.png"),
    source: "brand",
    steps: [
      "These tips stand alone (no article link). Upload the Part B Optimizer logo or a calm Medicare-education photo.",
      "Optional: Image Prompt 4 or 5 in Content Factory can produce a custom photo if you want variety.",
      "Keep images CMS-compliant: no Medicare card or government logos, no carrier/plan names, no star ratings or premiums, no readable text or disclaimers in the graphic, no enrollment CTAs.",
      "Paste the post text from this page after adding the image.",
    ],
  };
}

export function buildCalendarEventLinks(input: {
  event: EditorialCalendarEvent;
  draft?: CalendarDraftRef;
  batchId: string | null;
  draftBySlot: Map<string, CalendarDraftRef>;
}): CalendarResourceLink[] {
  const { event, draft, batchId, draftBySlot } = input;
  const links: CalendarResourceLink[] = [];
  const factoryHref = `/admin/content-factory?${new URLSearchParams({
    ...(batchId ? { batchId } : {}),
    type: event.type,
    slot: String(event.slotIndex),
  }).toString()}`;

  links.push({
    label: "Content Factory draft",
    href: factoryHref,
    description: "View or edit the generated draft",
  });

  switch (event.type) {
    case "article": {
      const slug = slugFromDraft(draft);
      if (slug) {
        links.push({
          label: "Learning Center article",
          href: learningCenterArticleUrl(slug),
          external: true,
          description: event.milestone === "launch" ? "Publish destination" : "Preview when live",
        });
        const imageDraft = getDraftFromMap(draftBySlot, "image_prompt", event.slotIndex);
        const heroHref = heroImageHrefIfUploaded(slug, imageDraft);
        if (heroHref) {
          links.push({
            label: "View hero image",
            href: heroHref,
            external: true,
            description: "Uploaded hero JPG for article header and Facebook posts",
          });
        } else {
          links.push({
            label: "Hero image (upload via Image Prompt)",
            description: `Target: public${heroImageTargetPath(slug, imageDraft)}`,
          });
        }
      }
      links.push({
        label: "Create Articles admin",
        href: "/admin/articles",
        description: "Generate hero image, edit markdown, download files",
      });
      const imageSlot = event.slotIndex;
      const imageDraftForLink = getDraftFromMap(draftBySlot, "image_prompt", imageSlot);
      if (imageDraftForLink) {
        links.push({
          label: `Image Prompt ${imageSlot + 1}`,
          href: `/admin/content-factory?${new URLSearchParams({
            ...(batchId ? { batchId } : {}),
            type: "image_prompt",
            slot: String(imageSlot),
          }).toString()}`,
          description: "AI prompt for the article hero photo",
        });
      }
      break;
    }
    case "image_prompt": {
      const promptText = imagePromptTextFromDraft(draft);
      const slug = resolveHeroSlugForImagePrompt(draft, draftBySlot, event.slotIndex);
      links.push({
        label: "Open image prompt",
        href: contentFactoryDraftHref(batchId, "image_prompt", event.slotIndex),
        description: promptText
          ? "View full prompt text in Content Factory"
          : "Image prompt draft in Content Factory",
      });
      if (slug) {
        const heroHref = heroImageHrefIfUploaded(slug, draft);
        if (heroHref) {
          links.push({
            label: "View hero image",
            href: heroHref,
            external: true,
            description: `Saved to public${heroImageTargetPath(slug, draft)}`,
          });
        } else {
          links.push({
            label: "Hero image (upload below)",
            description: `Target: public${heroImageTargetPath(slug, draft)} — upload after generating`,
          });
        }
      }
      const pairedArticle = imagePromptPairedArticleSlot(event.slotIndex);
      if (pairedArticle !== null) {
        const articleDraft = getDraftFromMap(draftBySlot, "article", pairedArticle);
        const articleSlug = slugFromDraft(articleDraft);
        if (articleSlug) {
          links.push({
            label: `Article ${pairedArticle + 1}`,
            href: learningCenterArticleUrl(articleSlug),
            external: true,
          });
        }
      }
      break;
    }
    case "facebook_post": {
      if (event.slotIndex === 99) break;
      links.push({
        label: "Copy post text",
        href: `/admin/facebook-posts?${new URLSearchParams({
          ...(batchId ? { batchId } : {}),
          slot: String(event.slotIndex),
        }).toString()}`,
        description: "Post copy, hashtags, and image instructions",
      });
      const guidance = facebookPostImageGuidance(event.slotIndex, draftBySlot);
      if (guidance.imageUrl) {
        links.push({
          label: "Facebook image",
          href: guidance.imageUrl,
          external: true,
          description: guidance.imageLabel,
        });
      }
      const articleSlot = facebookPostPairedArticleSlot(event.slotIndex);
      if (articleSlot !== null) {
        const articleDraft = getDraftFromMap(draftBySlot, "article", articleSlot);
        const articleSlug = slugFromDraft(articleDraft);
        if (articleSlug) {
          links.push({
            label: `Linked article ${articleSlot + 1}`,
            href: learningCenterArticleUrl(articleSlug),
            external: true,
          });
        }
      }
      break;
    }
    case "newsletter": {
      links.push({
        label: "Newsletter admin",
        href: "/admin/newsletter",
        description: "Preview send and featured articles",
      });
      break;
    }
    case "lead_magnet": {
      links.push({
        label: "Edit workbook",
        href: contentFactoryDraftHref(batchId, "lead_magnet", event.slotIndex),
        description: "Edit checklist markdown, then generate PDF below",
      });
      const pdfHref = leadMagnetPdfHrefIfSaved(draft);
      if (pdfHref) {
        links.push({
          label: "View workbook PDF",
          href: pdfHref,
          external: true,
          description: "Saved PDF in public/downloads/",
        });
      }
      break;
    }
    case "faq":
      break;
  }

  if (draft?.publishedRef && draft.publishedRef.startsWith("http") && !links.some((l) => l.href === draft.publishedRef)) {
    links.push({
      label: "Published URL",
      href: draft.publishedRef,
      external: true,
    });
  }

  return links;
}

export function primaryCalendarEventDestination(input: {
  event: EditorialCalendarEvent;
  draft?: CalendarDraftRef;
  batchId: string | null;
}):
  | { kind: "internal"; to: "/admin/content-factory" | "/admin/facebook-posts" | "/admin/newsletter" | "/admin/articles"; search?: Record<string, unknown> }
  | { kind: "external"; href: string }
  | null {
  const { event, draft, batchId } = input;

  if (event.slotIndex === 99) {
    return null;
  }

  switch (event.type) {
    case "facebook_post":
      return {
        kind: "internal",
        to: "/admin/facebook-posts",
        search: facebookPostAdminSearch(batchId, event.slotIndex),
      };
    case "newsletter":
      return { kind: "internal", to: "/admin/newsletter" };
    case "article": {
      const slug = slugFromDraft(draft);
      if (slug && event.milestone === "launch") {
        return { kind: "external", href: learningCenterArticleUrl(slug) };
      }
      return {
        kind: "internal",
        to: "/admin/content-factory",
        search: contentFactoryAdminSearch(batchId, event.type, event.slotIndex),
      };
    }
    default:
      return {
        kind: "internal",
        to: "/admin/content-factory",
        search: contentFactoryAdminSearch(batchId, event.type, event.slotIndex),
      };
  }
}
