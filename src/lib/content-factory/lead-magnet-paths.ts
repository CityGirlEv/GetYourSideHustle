import { slugifyArticleTitle } from "@/lib/article-authoring";
import { productionShareUrl } from "@/lib/site-url";
import type { CalendarDraftRef } from "@/lib/content-factory/editorial-calendar-links";

export const DEFAULT_WORKBOOK_SLUG = "PBO_Turning_65_Workbook";

/** Short label for TOC links and navigation. */
export const WORKBOOK_SHORT_LABEL = "PBO Turning 65 Wkbk";

/** Reader-facing workbook title (not an official Medicare document). */
export const WORKBOOK_DISPLAY_TITLE = "Part B Optimizer (PBO) Turning 65 Workbook";

export function workbookDownloadFilename(slug = DEFAULT_WORKBOOK_SLUG): string {
  return `${slug}.pdf`;
}

/** Published Learning Center article paired with the workbook Facebook post. */
export const WORKBOOK_FACEBOOK_ARTICLE_SLUG = "turning-65-and-still-working";

export function workbookFacebookArticleUrl(): string {
  return productionShareUrl(`/learning-center/${WORKBOOK_FACEBOOK_ARTICLE_SLUG}`);
}

/** Public PDF link for Facebook posts and email — always mypartb.com, not localhost. */
export function workbookDownloadUrl(slug = DEFAULT_WORKBOOK_SLUG): string {
  return productionShareUrl(leadMagnetPdfPublicPath(slug));
}

/** Landing page where visitors enter email before downloading the workbook PDF. */
export function workbookLandingUrl(slug = DEFAULT_WORKBOOK_SLUG): string {
  if (slug === DEFAULT_WORKBOOK_SLUG) {
    return productionShareUrl("/workbook");
  }
  return productionShareUrl(`/workbook/${slug}`);
}

export function leadMagnetSlugFromDraft(draft: Pick<CalendarDraftRef, "title" | "payload">): string {
  const fromPayload = draft.payload?.suggestedSlug;
  if (typeof fromPayload === "string" && fromPayload.trim()) {
    return fromPayload.trim();
  }
  return slugifyArticleTitle(draft.title) || "medicare-workbook";
}

export function leadMagnetPdfPublicPath(slug: string): string {
  return `/downloads/${slug}.pdf`;
}

export function workbookSocialTeaserFilename(slug: string): string {
  return `${slug}-facebook-teaser.jpg`;
}

export function workbookSocialTeaserPublicPath(slug: string): string {
  return `/downloads/${workbookSocialTeaserFilename(slug)}`;
}

export function workbookSocialTeaserPathFromPayload(
  payload: Record<string, unknown> | undefined,
): string | null {
  const path = payload?.socialTeaserPath;
  return typeof path === "string" && path.trim() ? path.trim() : null;
}

export function workbookSocialTeaserSavedAtFromPayload(
  payload: Record<string, unknown> | undefined,
): string | null {
  const at = payload?.socialTeaserSavedAt;
  return typeof at === "string" && at.trim() ? at.trim() : null;
}

export function workbookSocialTeaserHrefIfSaved(
  draft: Pick<CalendarDraftRef, "title" | "payload"> | undefined,
): string | null {
  const savedAt = workbookSocialTeaserSavedAtFromPayload(draft?.payload);
  if (!savedAt || !draft) return null;
  const path =
    workbookSocialTeaserPathFromPayload(draft.payload) ??
    workbookSocialTeaserPublicPath(leadMagnetSlugFromDraft(draft));
  return `${path}?v=${encodeURIComponent(savedAt)}`;
}

export function workbookSocialTeaserPreviewHref(
  draft: Pick<CalendarDraftRef, "title" | "payload"> | undefined,
): string | null {
  const saved = workbookSocialTeaserHrefIfSaved(draft);
  if (saved) return saved;
  if (!draft) return null;
  return workbookSocialTeaserPublicPath(leadMagnetSlugFromDraft(draft));
}

export function leadMagnetPdfPathFromPayload(
  payload: Record<string, unknown> | undefined,
): string | null {
  const path = payload?.pdfPath;
  return typeof path === "string" && path.trim() ? path.trim() : null;
}

export function leadMagnetPdfSavedAtFromPayload(
  payload: Record<string, unknown> | undefined,
): string | null {
  const at = payload?.pdfSavedAt;
  return typeof at === "string" && at.trim() ? at.trim() : null;
}

export function leadMagnetPdfHrefIfSaved(
  draft: Pick<CalendarDraftRef, "title" | "payload"> | undefined,
): string | null {
  const savedAt = leadMagnetPdfSavedAtFromPayload(draft?.payload);
  if (!savedAt || !draft) return null;
  const path =
    leadMagnetPdfPathFromPayload(draft.payload) ??
    leadMagnetPdfPublicPath(leadMagnetSlugFromDraft(draft));
  return `${path}?v=${encodeURIComponent(savedAt)}`;
}

/** Saved PDF with cache-bust, or the default public/downloads path for inline preview. */
export function leadMagnetPdfPreviewHref(
  draft: Pick<CalendarDraftRef, "title" | "payload"> | undefined,
): string | null {
  const saved = leadMagnetPdfHrefIfSaved(draft);
  if (saved) return saved;
  if (!draft) return null;
  return leadMagnetPdfPublicPath(leadMagnetSlugFromDraft(draft));
}
