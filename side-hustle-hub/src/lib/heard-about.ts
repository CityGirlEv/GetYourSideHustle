/**
 * Signup “How did you hear about us?” — stored as a notes stamp so Users Area
 * and admin signup alerts can report acquisition without extra schema.
 */

export const HEARD_ABOUT_SOURCES = [
  { id: "friend_family", label: "Friend or family" },
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "google", label: "Google search" },
  { id: "tina", label: "Tina / Pretty & Powerful" },
  { id: "workshop", label: "Workshop or event" },
  { id: "flyer", label: "Flyer or print" },
  { id: "youtube", label: "YouTube" },
  { id: "referral", label: "GYSH referral link" },
  { id: "other", label: "Other" },
] as const;

export type HeardAboutSourceId = (typeof HEARD_ABOUT_SOURCES)[number]["id"];

export const HEARD_ABOUT_STAMP_PREFIX = "Heard about us:";
const STAMP_RE = /Heard about us:\s*([^·]+)/i;
const OTHER_DETAIL_MAX = 80;

export type HeardAboutParse =
  | { ok: true; sourceId: HeardAboutSourceId; detail: string; label: string; stamp: string }
  | { ok: false; error: string };

function sourceById(id: string): (typeof HEARD_ABOUT_SOURCES)[number] | undefined {
  return HEARD_ABOUT_SOURCES.find((s) => s.id === id);
}

export function heardAboutLabel(sourceId: string, detail?: string | null): string {
  const source = sourceById(sourceId);
  if (!source) return "";
  const extra = String(detail || "").trim();
  if (source.id === "other" && extra) return `${source.label} — ${extra}`;
  return source.label;
}

export function formatHeardAboutStamp(sourceId: string, detail?: string | null): string {
  const label = heardAboutLabel(sourceId, detail);
  return label ? `${HEARD_ABOUT_STAMP_PREFIX} ${label}` : "";
}

export function heardAboutFromNotes(notes: string | null | undefined): string | null {
  const match = String(notes || "").match(STAMP_RE);
  const label = String(match?.[1] || "").trim();
  return label || null;
}

export function mergeHeardAboutNote(existingNotes: string, stamp: string): string {
  const nextStamp = String(stamp || "").trim();
  if (!nextStamp) return String(existingNotes || "").slice(0, 1900);
  const without = String(existingNotes || "")
    .replace(/(?:^| · )Heard about us:\s*[^·]+/gi, "")
    .replace(/^ · /, "")
    .trim();
  return `${without}${without ? " · " : ""}${nextStamp}`.slice(0, 1900);
}

export function parseHeardAboutInput(body: unknown): HeardAboutParse {
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Tell us how you heard about us." };
  }
  const raw = body as Record<string, unknown>;
  const nested =
    raw.heardAbout && typeof raw.heardAbout === "object" && !Array.isArray(raw.heardAbout)
      ? (raw.heardAbout as Record<string, unknown>)
      : raw;
  const sourceId = String(nested.sourceId ?? nested.heardAboutSource ?? raw.heardAboutSource ?? "")
    .trim()
    .toLowerCase();
  const source = sourceById(sourceId);
  if (!source) {
    return { ok: false, error: "Tell us how you heard about us." };
  }
  const detail = String(nested.detail ?? nested.heardAboutDetail ?? raw.heardAboutDetail ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, OTHER_DETAIL_MAX);
  if (source.id === "other" && detail.length < 2) {
    return { ok: false, error: "Please add a short note for Other." };
  }
  const label = heardAboutLabel(source.id, detail);
  return {
    ok: true,
    sourceId: source.id,
    detail: source.id === "other" ? detail : "",
    label,
    stamp: formatHeardAboutStamp(source.id, detail),
  };
}
