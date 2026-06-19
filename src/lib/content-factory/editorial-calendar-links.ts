import { featuredImagePathForSlug } from "@/lib/learning-center-image-prompts";
import { canonicalUrl } from "@/lib/site-url";
import type { ContentAssetType, ContentDraft } from "@/lib/content-factory/types";
import type { EditorialCalendarEvent } from "@/lib/content-factory/weekly-editorial-schedule";
import { facebookPostAdminSearch } from "@/lib/content-factory/facebook-post-copy";

export type CalendarDraftRef = Pick<
  ContentDraft,
  "id" | "status" | "title" | "payload" | "publishedRef" | "type" | "slotIndex"
>;

export interface CalendarResourceLink {
  label: string;
  href: string;
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

export function facebookPostImageGuidance(
  fbSlotIndex: number,
  draftBySlot: Map<string, CalendarDraftRef>,
): FacebookPostImageGuidance {
  const articleSlot = facebookPostPairedArticleSlot(fbSlotIndex);
  if (articleSlot !== null) {
    const articleDraft = getDraftFromMap(draftBySlot, "article", articleSlot);
    const slug = slugFromDraft(articleDraft);
    const imageUrl = slug ? featuredImageUrlForSlug(slug) : null;
    const imagePromptDraft = getDraftFromMap(draftBySlot, "image_prompt", articleSlot);

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
      "Keep images TPMO-safe: no plan names, no enrollment CTAs, no fine-print disclaimers baked into the graphic.",
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
        links.push({
          label: "Hero image",
          href: featuredImageUrlForSlug(slug),
          external: true,
          description: "Featured JPG for article header and Facebook posts",
        });
      }
      links.push({
        label: "Create Articles admin",
        href: "/admin/articles",
        description: "Generate hero image, edit markdown, download files",
      });
      const imageSlot = event.slotIndex;
      const imageDraft = getDraftFromMap(draftBySlot, "image_prompt", imageSlot);
      if (imageDraft) {
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
      const slug = slugFromDraft(draft);
      const pairedArticle = imagePromptPairedArticleSlot(event.slotIndex);
      if (slug) {
        links.push({
          label: "Target hero JPG",
          href: featuredImageUrlForSlug(slug),
          external: true,
          description: "Upload generated image to this path",
        });
      }
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
      links.push({
        label: "Create Articles admin",
        href: "/admin/articles",
        description: "Paste prompt and download hero image",
      });
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
    case "lead_magnet":
    case "faq":
      break;
  }

  if (draft?.publishedRef && !links.some((l) => l.href === draft.publishedRef)) {
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
