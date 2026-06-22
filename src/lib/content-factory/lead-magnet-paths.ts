import { slugifyArticleTitle } from "@/lib/article-authoring";
import { canonicalUrl } from "@/lib/site-url";
import type { CalendarDraftRef } from "@/lib/content-factory/editorial-calendar-links";

export const DEFAULT_WORKBOOK_SLUG = "medicare-at-65-planning-workbook";

export function workbookDownloadUrl(slug = DEFAULT_WORKBOOK_SLUG): string {
  return canonicalUrl(leadMagnetPdfPublicPath(slug));
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
