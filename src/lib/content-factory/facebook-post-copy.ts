import { getRuntimeConfig } from "@/lib/env";
import type { ContentDraft } from "@/lib/content-factory/types";
import { WORKBOOK_PAGE_FB_SLOT } from "@/lib/content-factory/workbook-facebook-posts";

/** Unicode Mathematical Sans-Serif Bold — renders as bold when pasted into Facebook. */
const FB_BOLD_UPPER_OFFSET = 0x1d5d4 - 0x41;
const FB_BOLD_LOWER_OFFSET = 0x1d5ee - 0x61;
const FB_BOLD_DIGIT_OFFSET = 0x1d7ec - 0x30;

export function toFacebookBold(text: string): string {
  return [...text]
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 0x41 && code <= 0x5a) {
        return String.fromCodePoint(code + FB_BOLD_UPPER_OFFSET);
      }
      if (code >= 0x61 && code <= 0x7a) {
        return String.fromCodePoint(code + FB_BOLD_LOWER_OFFSET);
      }
      if (code >= 0x30 && code <= 0x39) {
        return String.fromCodePoint(code + FB_BOLD_DIGIT_OFFSET);
      }
      return char;
    })
    .join("");
}

function bodyAlreadyStartsWithTitle(body: string, title: string): boolean {
  const trimmed = body.trim();
  if (!title) return true;
  if (trimmed.startsWith(title)) return true;
  const boldTitle = toFacebookBold(title);
  return trimmed.startsWith(boldTitle);
}

function formatFacebookPostWithTitle(
  draft: Pick<ContentDraft, "body" | "title">,
  body: string,
): string {
  const trimmedBody = body.trim();
  const title = draft.title.trim();
  if (!title || bodyAlreadyStartsWithTitle(trimmedBody, title)) {
    return trimmedBody;
  }
  return `${toFacebookBold(title)}\n\n${trimmedBody}`;
}

export function facebookPageUrl(): string | null {
  const url = getRuntimeConfig("PUBLIC_FACEBOOK_PAGE_URL")?.trim();
  return url || null;
}

export function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\w]+/g);
  return matches ? [...new Set(matches)] : [];
}

/** Post body without a trailing hashtag-only line (hashtags shown separately). */
export function facebookPostBodyWithoutHashtags(body: string): string {
  const lines = body.trim().split("\n");
  while (lines.length > 0 && /^#[\w]+(\s+#[\w]+)*$/.test(lines[lines.length - 1]!.trim())) {
    lines.pop();
  }
  return lines.join("\n").trim();
}

export function formatFacebookPasteText(
  draft: Pick<ContentDraft, "body" | "title">,
): string {
  return formatFacebookPostWithTitle(draft, draft.body);
}

/** Post preview (body without trailing hashtags) with bold title for admin display. */
export function formatFacebookPostPreviewText(
  draft: Pick<ContentDraft, "body" | "title">,
): string {
  return formatFacebookPostWithTitle(draft, facebookPostBodyWithoutHashtags(draft.body));
}

export function facebookPostAdminSearch(
  batchId: string | null | undefined,
  slotIndex: number,
): { batchId?: string; slot: number } {
  return batchId ? { batchId, slot: slotIndex } : { slot: slotIndex };
}

/** Deep-link to the grouped workbook posts card on Facebook Posts admin. */
export function facebookWorkbookPostsAdminSearch(
  batchId: string | null | undefined,
): { batchId?: string; slot: number; workbook: true } {
  return {
    ...(batchId ? { batchId } : {}),
    slot: WORKBOOK_PAGE_FB_SLOT,
    workbook: true,
  };
}
