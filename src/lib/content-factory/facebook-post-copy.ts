import { getRuntimeConfig } from "@/lib/env";
import type { ContentDraft } from "@/lib/content-factory/types";

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
  return draft.body.trim();
}

export function facebookPostAdminSearch(
  batchId: string | null | undefined,
  slotIndex: number,
): { batchId?: string; slot: number } {
  return batchId ? { batchId, slot: slotIndex } : { slot: slotIndex };
}
