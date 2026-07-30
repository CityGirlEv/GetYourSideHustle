import { jsPDF } from "jspdf";
import {
  AGENDA_CATEGORY_LABELS,
  DEFAULT_AGENDA_TIMEZONE,
  agendaItemSourceRef,
  type AgendaCategory,
  type AgendaItem,
  type AgendaMeta,
} from "./gysh-partner-agenda";
import {
  PDF_BRAND_COLORS,
  PDF_CONTENT_BOTTOM,
  PDF_CONTENT_TOP,
  PDF_CONTENT_W as CONTENT_W,
  PDF_MARGIN as MARGIN,
  applyPdfPageBranding,
  drawPdfPageChrome,
  loadPdfLogoDataUrl,
} from "./pdf-branding";
import { openPdfInBrowser, reservePdfTab } from "./open-pdf";

/** Partner meeting length used for timed agenda slots. */
export const AGENDA_MEETING_MINUTES = 60;
/** Closing Q&A block (always last). */
export const AGENDA_QA_MINUTES = 7;
/** Two empty agenda slots Tina can fill if needed (4 & 4). */
export const AGENDA_TINA_PLACEHOLDER_COUNT = 2;
export const AGENDA_TINA_PLACEHOLDER_MINUTES = 4;
/** @deprecated use AGENDA_TINA_PLACEHOLDER_* */
export const AGENDA_TINA_BUFFER_MINUTES =
  AGENDA_TINA_PLACEHOLDER_COUNT * AGENDA_TINA_PLACEHOLDER_MINUTES;
/** Do not shave Monies spent below this when packing more items. */
export const AGENDA_MONIES_FLOOR_MINUTES = 5;

export const AGENDA_RESERVED_QA_ID = "__agenda_qa__";
export function agendaTinaPlaceholderId(index: number): string {
  return `__agenda_tina_placeholder_${index}__`;
}

const COLORS = {
  ink: PDF_BRAND_COLORS.charcoal,
  muted: PDF_BRAND_COLORS.muted,
  soft: PDF_BRAND_COLORS.muted,
  line: PDF_BRAND_COLORS.line,
  accent: PDF_BRAND_COLORS.wine,
  chipBg: PDF_BRAND_COLORS.cream,
};

export type PartnerAgendaPdfDraft = {
  category?: AgendaCategory;
  importance?: number;
  discussionNotes?: string;
  questionsText?: string;
  actionItemsText?: string;
  sortOrder?: number;
};

export type PartnerAgendaPdfInput = {
  agenda: AgendaMeta;
  items: AgendaItem[];
  /** Unsaved preview edits (optional). */
  drafts?: Record<string, PartnerAgendaPdfDraft>;
  meetingDate?: string;
  meetingTime?: string;
  meetingTimezone?: string;
  invitedText?: string;
  attendedText?: string;
  /** Total meeting length in minutes (default 60). */
  meetingMinutes?: number;
  /** When true, omit DRAFT watermark (Finalize Agenda). */
  finalized?: boolean;
};

export type AgendaTimedSlot = {
  id: string;
  startMin: number;
  endMin: number;
  durationMin: number;
  startLabel: string;
  endLabel: string;
  rangeLabel: string;
  /** Reserved closing blocks (Tina placeholders / Q&A). */
  kind?: "item" | "tina-placeholder" | "qa";
  title?: string;
  /** Topic body when a Tina placeholder is filled. */
  body?: string;
  /** True when a Tina-authored agenda item occupies this placeholder. */
  filled?: boolean;
};

/** Items authored by Tina go into the reserved Tina placeholder slots. */
export function isTinaAgendaAuthor(name: string | null | undefined): boolean {
  return /\btina\b/i.test(String(name || "").trim());
}

export type AgendaSchedule = {
  itemSlots: Map<string, AgendaTimedSlot>;
  reserved: AgendaTimedSlot[];
  discussionMinutes: number;
  meetingMinutes: number;
};

type Ctx = { doc: jsPDF; y: number };

type ResolvedItem = {
  id: string;
  title: string;
  body: string;
  sourceRef: string | null;
  sourceKind: "task" | "test" | null;
  category: AgendaCategory;
  importance: number;
  notes: string;
  questions: string;
  actions: string;
  sortOrder: number;
  createdAt: string;
  authorName: string;
};

function ensureSpace(ctx: Ctx, needed: number) {
  if (ctx.y + needed <= PDF_CONTENT_BOTTOM) return;
  ctx.doc.addPage();
  drawPdfPageChrome(ctx.doc);
  ctx.y = PDF_CONTENT_TOP;
}

function parseHhMmToMinutes(time24: string | null | undefined): number | null {
  if (!time24) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(time24.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min) || h < 0 || h > 23 || min < 0 || min > 59) {
    return null;
  }
  return h * 60 + min;
}

function formatMinutesAs12h(totalMin: number): string {
  const normalized = ((totalMin % (24 * 60)) + 24 * 60) % (24 * 60);
  let h = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(minute).padStart(2, "0")} ${ampm}`;
}

function formatMeetingWhen(input: PartnerAgendaPdfInput): string {
  const date = (input.meetingDate ?? input.agenda.meetingDate)?.trim() || "Date TBD";
  const timeRaw = input.meetingTime ?? input.agenda.meetingTime;
  const startMins = parseHhMmToMinutes(timeRaw);
  const meetingMinutes = input.meetingMinutes ?? AGENDA_MEETING_MINUTES;
  const tz =
    (input.meetingTimezone ?? input.agenda.meetingTimezone)?.trim() || DEFAULT_AGENDA_TIMEZONE;
  if (startMins == null) return `${date} · Time TBD · ${tz} · ${meetingMinutes} min`;
  const endLabel = formatMinutesAs12h(startMins + meetingMinutes);
  return `${date} · ${formatMinutesAs12h(startMins)} – ${endLabel} · ${tz}`;
}

function itemTitle(body: string): string {
  const first = String(body || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find(Boolean);
  if (!first) return "Untitled item";
  const cleaned = first.replace(/^agenda\s*item\s*:\s*/i, "").trim() || first;
  return cleaned.length > 100 ? `${cleaned.slice(0, 97)}…` : cleaned;
}

function questionsFromItem(it: AgendaItem, draft?: PartnerAgendaPdfDraft): string {
  if (draft?.questionsText != null) return draft.questionsText.trim();
  return (it.questions || [])
    .map((q) => q.text.trim())
    .filter(Boolean)
    .join("\n");
}

function actionsFromItem(it: AgendaItem, draft?: PartnerAgendaPdfDraft): string {
  if (draft?.actionItemsText != null) return draft.actionItemsText.trim();
  return (it.actionItems || [])
    .map((a) => {
      const owner = a.owner?.trim() ? ` (${a.owner.trim()})` : "";
      const done = a.done ? "[x] " : "[ ] ";
      return `${done}${a.text.trim()}${owner}`;
    })
    .filter((line) => line.replace(/^\[.\]\s*/, "").trim())
    .join("\n");
}

function resolveItems(input: PartnerAgendaPdfInput): ResolvedItem[] {
  return input.items.map((it) => {
    const draft = input.drafts?.[it.id];
    const body = String(it.body || "").trim();
    const sourceRef = agendaItemSourceRef(it);
    const sourceKind =
      it.source === "task" || it.source === "test" ? it.source : null;
    return {
      id: it.id,
      title: itemTitle(body),
      body,
      sourceRef,
      sourceKind: sourceRef ? sourceKind : null,
      category: draft?.category || it.category || "other",
      importance: draft?.importance ?? it.importance ?? 3,
      notes: (draft?.discussionNotes ?? it.discussionNotes ?? "").trim(),
      questions: questionsFromItem(it, draft),
      actions: actionsFromItem(it, draft),
      sortOrder: draft?.sortOrder ?? it.sortOrder ?? 0,
      createdAt: it.createdAt || it.id,
      authorName: String(it.authorName || "").trim(),
    };
  });
}

/** Rough discussion weight before scaling into the meeting hour. */
function estimateRawMinutes(item: ResolvedItem): number {
  const importanceBase: Record<number, number> = { 1: 10, 2: 8, 3: 6, 4: 5, 5: 4 };
  let mins = importanceBase[item.importance] ?? 6;

  const categoryBoost: Record<AgendaCategory, number> = {
    financial: 2,
    process: 1.5,
    website: 1,
    other: 0.5,
  };
  mins += categoryBoost[item.category] ?? 0.5;

  const text = `${item.title}\n${item.body}\n${item.notes}\n${item.questions}\n${item.actions}`.toLowerCase();
  // Monies spent starts generous so we can shave it first when the agenda grows.
  if (isMoniesSpentItem(item)) mins += 4;
  else if (/(monies|money|spent|receipt|expense|budget)/.test(text)) mins += 2;
  if (/(percent|split|allocation|equity)/.test(text)) mins += 2;
  if (/(legal|llc|contract|responsib)/.test(text)) mins += 2;
  if (/(sprint|testing process)/.test(text)) mins += 1.5;
  if (/(stripe|payment method)/.test(text)) mins += 1;
  if (/(signup|walk through|coach)/.test(text)) mins += 1.5;
  if (/(free member|guides)/.test(text)) mins += 0.5;
  if (item.questions.split("\n").filter(Boolean).length >= 2) mins += 1;
  if (item.actions.split("\n").filter(Boolean).length >= 2) mins += 1;
  if (item.body.length > 160) mins += 1;

  return Math.max(3, mins);
}

function isMoniesSpentItem(item: Pick<ResolvedItem, "title" | "body">): boolean {
  const text = `${item.title}\n${item.body}`.toLowerCase();
  return /monies\s*spent|money\s*spent|what has been spent/.test(text);
}

function makeSlot(
  id: string,
  startMin: number,
  durationMin: number,
  opts?: {
    kind?: AgendaTimedSlot["kind"];
    title?: string;
    body?: string;
    filled?: boolean;
  },
): AgendaTimedSlot {
  const endMin = startMin + durationMin;
  const startLabel = formatMinutesAs12h(startMin);
  const endLabel = formatMinutesAs12h(endMin);
  return {
    id,
    startMin,
    endMin,
    durationMin,
    startLabel,
    endLabel,
    rangeLabel: `${startLabel} – ${endLabel} (${durationMin} min)`,
    kind: opts?.kind ?? "item",
    title: opts?.title,
    body: opts?.body,
    filled: opts?.filled,
  };
}

/**
 * Pack discussion items into `totalMinutes`.
 * When over budget, shave Monies spent first (down to AGENDA_MONIES_FLOOR_MINUTES),
 * then trim other lowest-weight items.
 */
function scaleDurations(
  raw: number[],
  totalMinutes: number,
  shaveFirst: boolean[],
): number[] {
  if (raw.length === 0) return [];
  const minEach = Math.max(3, Math.floor(totalMinutes / (raw.length * 3)) || 3);
  const cappedMin = Math.min(minEach, Math.floor(totalMinutes / raw.length));
  const floor = Math.max(3, cappedMin);

  let minFloor = floor;
  while (minFloor > 1 && minFloor * raw.length > totalMinutes) minFloor -= 1;

  const weights = raw.map((r) => Math.max(minFloor, r));
  const weightSum = weights.reduce((a, b) => a + b, 0) || 1;
  const ideal = weights.map((w) => (w / weightSum) * totalMinutes);
  const durations = ideal.map((v) => Math.max(minFloor, Math.floor(v)));

  let used = durations.reduce((a, b) => a + b, 0);
  let guard = 0;
  while (used < totalMinutes && guard < 500) {
    const order = durations
      .map((d, i) => ({ i, rem: ideal[i] - d, w: weights[i], shave: shaveFirst[i] }))
      // Prefer giving leftover to non–Monies-spent items (keep Monies as the flex donor).
      .sort((a, b) => Number(a.shave) - Number(b.shave) || b.rem - a.rem || b.w - a.w);
    durations[order[0].i] += 1;
    used += 1;
    guard += 1;
  }

  const floorFor = (i: number) =>
    shaveFirst[i] ? Math.max(AGENDA_MONIES_FLOOR_MINUTES, minFloor) : minFloor;

  guard = 0;
  while (used > totalMinutes && guard < 500) {
    // 1) Shave Monies spent first while above its floor.
    const monies = durations
      .map((d, i) => ({ i, d, w: weights[i] }))
      .filter((x) => shaveFirst[x.i] && x.d > floorFor(x.i))
      .sort((a, b) => b.d - a.d || a.w - b.w);
    if (monies.length) {
      durations[monies[0].i] -= 1;
      used -= 1;
      guard += 1;
      continue;
    }
    // 2) Then trim other items.
    const order = durations
      .map((d, i) => ({ i, d, w: weights[i] }))
      .filter((x) => !shaveFirst[x.i] && x.d > floorFor(x.i))
      .sort((a, b) => a.w - b.w || b.d - a.d);
    if (!order.length) break;
    durations[order[0].i] -= 1;
    used -= 1;
    guard += 1;
  }
  return durations;
}

function resolvePartialItems(
  items: ResolvedItem[] | Array<{ id: string } & Partial<ResolvedItem>>,
): ResolvedItem[] {
  const ordered = [...items].sort((a, b) => {
    const ao = a.sortOrder ?? 0;
    const bo = b.sortOrder ?? 0;
    if (ao !== bo) return ao - bo;
    return String(a.createdAt || a.id).localeCompare(String(b.createdAt || b.id));
  });
  return ordered.map((it) => {
    if ("title" in it && it.title && "category" in it && it.category) {
      return {
        ...(it as ResolvedItem),
        authorName: String((it as ResolvedItem).authorName || "").trim(),
      };
    }
    return {
      id: it.id,
      title: itemTitle(String((it as ResolvedItem).body || "")),
      body: String((it as ResolvedItem).body || ""),
      sourceRef: (it as ResolvedItem).sourceRef ?? null,
      sourceKind: (it as ResolvedItem).sourceKind ?? null,
      category: (it.category || "other") as AgendaCategory,
      importance: it.importance ?? 3,
      notes: String((it as ResolvedItem).notes || ""),
      questions: String((it as ResolvedItem).questions || ""),
      actions: String((it as ResolvedItem).actions || ""),
      sortOrder: it.sortOrder ?? 0,
      createdAt: String((it as ResolvedItem).createdAt || it.id),
      authorName: String((it as ResolvedItem).authorName || "").trim(),
    };
  });
}

/**
 * Build a 60-min schedule:
 * discussion items → 2×4 min Tina placeholders (filled by Tina's items) → 7 min Q&A.
 * Extra items pull time from Monies spent first.
 * Tina-authored items (up to placeholder count) occupy the Tina slots; extras stay in discussion.
 */
export function allocateAgendaSchedule(input: {
  items: ResolvedItem[] | Array<{ id: string } & Partial<ResolvedItem>>;
  meetingTime?: string | null;
  meetingMinutes?: number;
  qaMinutes?: number;
  tinaPlaceholderCount?: number;
  tinaPlaceholderMinutes?: number;
}): AgendaSchedule {
  const meetingMinutes = input.meetingMinutes ?? AGENDA_MEETING_MINUTES;
  const qaMinutes = input.qaMinutes ?? AGENDA_QA_MINUTES;
  const tinaCount = input.tinaPlaceholderCount ?? AGENDA_TINA_PLACEHOLDER_COUNT;
  const tinaEach = input.tinaPlaceholderMinutes ?? AGENDA_TINA_PLACEHOLDER_MINUTES;
  const tinaTotal = tinaCount * tinaEach;
  const discussionMinutes = Math.max(0, meetingMinutes - qaMinutes - tinaTotal);
  // Default 3:30 PM Central when meeting time is unset (matches Agenda Configure).
  const startMins = parseHhMmToMinutes(input.meetingTime) ?? 15 * 60 + 30;

  const resolved = resolvePartialItems(input.items);
  const tinaCandidates = resolved.filter((item) => isTinaAgendaAuthor(item.authorName));
  const tinaFill = tinaCandidates.slice(0, tinaCount);
  const tinaFillIds = new Set(tinaFill.map((item) => item.id));
  const discussion = resolved.filter((item) => !tinaFillIds.has(item.id));

  const raw = discussion.map(estimateRawMinutes);
  const shaveFirst = discussion.map(isMoniesSpentItem);
  const durations = scaleDurations(raw, discussionMinutes, shaveFirst);

  const itemSlots = new Map<string, AgendaTimedSlot>();
  let cursor = startMins;
  discussion.forEach((item, idx) => {
    const durationMin = durations[idx] ?? 3;
    const slot = makeSlot(item.id, cursor, durationMin, { kind: "item" });
    itemSlots.set(item.id, slot);
    cursor = slot.endMin;
  });

  const reserved: AgendaTimedSlot[] = [];
  for (let i = 1; i <= tinaCount; i++) {
    const filled = tinaFill[i - 1];
    if (filled) {
      const slot = makeSlot(filled.id, cursor, tinaEach, {
        kind: "tina-placeholder",
        title: filled.title,
        body: filled.body,
        filled: true,
      });
      itemSlots.set(filled.id, slot);
      reserved.push(slot);
    } else {
      reserved.push(
        makeSlot(agendaTinaPlaceholderId(i), cursor, tinaEach, {
          kind: "tina-placeholder",
          title: `Tina placeholder ${i} — add topic if needed`,
          filled: false,
        }),
      );
    }
    cursor += tinaEach;
  }
  reserved.push(
    makeSlot(AGENDA_RESERVED_QA_ID, cursor, qaMinutes, {
      kind: "qa",
      title: "Q & A",
    }),
  );

  return {
    itemSlots,
    reserved,
    discussionMinutes,
    meetingMinutes,
  };
}

/** @deprecated prefer allocateAgendaSchedule / buildAgendaSchedule */
export function allocateAgendaItemTimes(input: {
  items: ResolvedItem[] | Array<{ id: string } & Partial<ResolvedItem>>;
  meetingTime?: string | null;
  meetingMinutes?: number;
}): Map<string, AgendaTimedSlot> {
  return allocateAgendaSchedule(input).itemSlots;
}

/** Public helper for UI: resolve drafts + full timed schedule. */
export function buildAgendaSchedule(input: PartnerAgendaPdfInput): AgendaSchedule {
  const items = resolveItems(input);
  return allocateAgendaSchedule({
    items,
    meetingTime: input.meetingTime ?? input.agenda.meetingTime,
    meetingMinutes: input.meetingMinutes ?? AGENDA_MEETING_MINUTES,
  });
}

/** Item-only map (compat). */
export function buildAgendaTimedSlots(input: PartnerAgendaPdfInput): Map<string, AgendaTimedSlot> {
  return buildAgendaSchedule(input).itemSlots;
}

function para(
  ctx: Ctx,
  text: string,
  opts?: { size?: number; color?: [number, number, number]; bold?: boolean; gap?: number },
) {
  const size = opts?.size ?? 10;
  const color = opts?.color ?? COLORS.ink;
  const gap = opts?.gap ?? 6;
  ctx.doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
  ctx.doc.setFontSize(size);
  ctx.doc.setTextColor(...color);
  const lines = ctx.doc.splitTextToSize(text, CONTENT_W) as string[];
  const lineH = size + 3;
  ensureSpace(ctx, lines.length * lineH + gap);
  for (const line of lines) {
    ctx.doc.text(line, MARGIN, ctx.y);
    ctx.y += lineH;
  }
  ctx.y += gap;
}

function labelValue(ctx: Ctx, label: string, value: string) {
  if (!value.trim()) return;
  ensureSpace(ctx, 28);
  ctx.doc.setFont("helvetica", "bold");
  ctx.doc.setFontSize(9);
  ctx.doc.setTextColor(...COLORS.soft);
  ctx.doc.text(label.toUpperCase(), MARGIN, ctx.y);
  ctx.y += 12;
  para(ctx, value, { size: 10, color: COLORS.ink, gap: 8 });
}

function itemBlock(
  ctx: Ctx,
  item: ResolvedItem,
  index: number,
  slot: AgendaTimedSlot | undefined,
) {
  ensureSpace(ctx, 56);
  ctx.doc.setFillColor(...COLORS.chipBg);
  ctx.doc.roundedRect(MARGIN, ctx.y - 2, CONTENT_W, 28, 3, 3, "F");

  ctx.doc.setFont("helvetica", "bold");
  ctx.doc.setFontSize(9);
  ctx.doc.setTextColor(...COLORS.accent);
  const timeLine = slot?.rangeLabel || "Time TBD";
  ctx.doc.text(timeLine, MARGIN + 6, ctx.y + 10);

  ctx.doc.setFont("helvetica", "normal");
  ctx.doc.setFontSize(8);
  ctx.doc.setTextColor(...COLORS.muted);
  const sourceBit = item.sourceRef
    ? `${item.sourceKind === "test" ? "Test" : "Task"} ${item.sourceRef} · `
    : "";
  const meta = `${sourceBit}${AGENDA_CATEGORY_LABELS[item.category]} · Importance ${item.importance}`;
  ctx.doc.text(meta, MARGIN + CONTENT_W - 6, ctx.y + 10, { align: "right" });

  ctx.doc.setFont("helvetica", "bold");
  ctx.doc.setFontSize(10);
  ctx.doc.setTextColor(...COLORS.ink);
  const refPrefix = item.sourceRef ? `[${item.sourceRef}] ` : "";
  const title = `${index}. ${refPrefix}${item.title}`;
  const titleLines = ctx.doc.splitTextToSize(title, CONTENT_W - 12) as string[];
  ctx.doc.text(titleLines[0] || title, MARGIN + 6, ctx.y + 22);
  ctx.y += 34;

  const bodyLines = item.body
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (bodyLines.length > 1) {
    para(ctx, bodyLines.slice(1).join("\n"), { size: 9, color: COLORS.muted, gap: 6 });
  }

  labelValue(ctx, "Notes", item.notes);
  labelValue(ctx, "Questions", item.questions);
  labelValue(ctx, "Actions", item.actions);
  ctx.y += 4;
}

export async function buildPartnerAgendaPdf(input: PartnerAgendaPdfInput): Promise<{
  doc: jsPDF;
  filename: string;
}> {
  const logoDataUrl = await loadPdfLogoDataUrl();
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  drawPdfPageChrome(doc);
  const ctx: Ctx = { doc, y: PDF_CONTENT_TOP };

  const invited =
    input.invitedText?.trim() ||
    (input.agenda.invited || []).join(", ").trim() ||
    "—";
  const attended =
    input.attendedText?.trim() ||
    (input.agenda.attended || []).join(", ").trim() ||
    "—";

  const meetingMinutes = input.meetingMinutes ?? AGENDA_MEETING_MINUTES;
  const finalized = Boolean(input.finalized ?? input.agenda.finalized ?? input.agenda.finalizedAt);
  const items = resolveItems(input).sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    if (a.importance !== b.importance) return a.importance - b.importance;
    return a.createdAt.localeCompare(b.createdAt);
  });
  const schedule = allocateAgendaSchedule({
    items,
    meetingTime: input.meetingTime ?? input.agenda.meetingTime,
    meetingMinutes,
  });

  para(ctx, formatMeetingWhen(input), { size: 14, bold: true, gap: 4 });
  if (!finalized) {
    para(ctx, "TENTATIVE / DRAFT — not finalized", { size: 10, color: COLORS.accent, bold: true, gap: 6 });
  }
  para(
    ctx,
    `${meetingMinutes}-minute meeting · ${schedule.discussionMinutes} min topics · ${AGENDA_TINA_PLACEHOLDER_COUNT}×${AGENDA_TINA_PLACEHOLDER_MINUTES} min Tina placeholders · ${AGENDA_QA_MINUTES} min Q&A`,
    {
      size: 9,
      color: COLORS.muted,
      gap: 8,
    },
  );
  para(ctx, `Invited: ${invited}`, { size: 10, color: COLORS.muted, gap: 2 });
  para(ctx, `Attended: ${attended}`, { size: 10, color: COLORS.muted, gap: 12 });

  const discussionItems = items.filter((item) => {
    const slot = schedule.itemSlots.get(item.id);
    return slot?.kind !== "tina-placeholder";
  });
  if (discussionItems.length === 0) {
    para(ctx, "No discussion agenda items yet.", { size: 10, color: COLORS.muted });
  } else {
    discussionItems.forEach((item, idx) =>
      itemBlock(ctx, item, idx + 1, schedule.itemSlots.get(item.id)),
    );
  }

  for (const slot of schedule.reserved) {
    ensureSpace(ctx, 40);
    ctx.doc.setFillColor(...COLORS.chipBg);
    ctx.doc.roundedRect(MARGIN, ctx.y - 2, CONTENT_W, 28, 3, 3, "F");
    ctx.doc.setFont("helvetica", "bold");
    ctx.doc.setFontSize(9);
    ctx.doc.setTextColor(...COLORS.accent);
    ctx.doc.text(slot.rangeLabel, MARGIN + 6, ctx.y + 10);
    ctx.doc.setFontSize(10);
    ctx.doc.setTextColor(...COLORS.ink);
    const heading =
      slot.kind === "qa"
        ? slot.title || "Q & A"
        : slot.filled
          ? `Tina: ${slot.title || "Topic"}`
          : slot.title || "Tina placeholder";
    ctx.doc.text(heading, MARGIN + 6, ctx.y + 22);
    ctx.y += 36;
    if (slot.kind === "tina-placeholder") {
      if (slot.filled && slot.body?.trim()) {
        const bodyLines = slot.body
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        // Title already shown; print remaining lines if multi-line.
        const rest = bodyLines.slice(bodyLines[0] === slot.title ? 1 : 0);
        if (rest.length) {
          para(ctx, rest.join("\n"), { size: 9, color: COLORS.muted, gap: 8 });
        } else {
          ctx.y += 4;
        }
      } else {
        para(ctx, "Blank agenda slot — Tina can add a topic here if needed.", {
          size: 9,
          color: COLORS.muted,
          gap: 8,
        });
      }
    } else if (slot.kind === "qa") {
      para(ctx, "Last 7 minutes — closing questions and wrap-up.", {
        size: 9,
        color: COLORS.muted,
        gap: 8,
      });
    }
  }

  const meetingActions = (input.agenda.meetingActionItems || []).filter((a) => a.text?.trim());
  if (meetingActions.length > 0) {
    ensureSpace(ctx, 36);
    ctx.doc.setDrawColor(...COLORS.line);
    ctx.doc.setLineWidth(0.6);
    ctx.doc.line(MARGIN, ctx.y, MARGIN + CONTENT_W, ctx.y);
    ctx.y += 14;
    para(ctx, "Action items", { size: 13, bold: true, gap: 8 });
    meetingActions.forEach((a, idx) => {
      const owner = a.owner?.trim() ? ` — ${a.owner.trim()}` : " — Unassigned";
      const done = a.done ? "[x] " : "[ ] ";
      const backlog = a.backlogTaskId ? ` (${a.backlogTaskId})` : "";
      para(ctx, `${done}${idx + 1}. ${a.text.trim()}${owner}${backlog}`, {
        size: 10,
        gap: 4,
      });
    });
  }

  const dateSlug = ((input.meetingDate ?? input.agenda.meetingDate) || "draft").replace(/\W+/g, "-");
  const filename = `${finalized ? "agenda" : "tentative-agenda"}-${dateSlug}.pdf`;
  const updatedAtRaw = input.agenda.updatedAt ? new Date(input.agenda.updatedAt) : new Date();
  const updatedAt = Number.isNaN(updatedAtRaw.getTime()) ? new Date() : updatedAtRaw;
  const updatedBy =
    String(input.agenda.updatedByName || "").trim() ||
    String(input.agenda.createdByName || "").trim() ||
    undefined;
  applyPdfPageBranding(doc, "Meeting Agenda", logoDataUrl, updatedAt, {
    draft: !finalized,
    updatedBy,
  });
  return { doc, filename };
}

export async function partnerAgendaPdfBase64(input: PartnerAgendaPdfInput): Promise<{
  base64: string;
  filename: string;
}> {
  const { doc, filename } = await buildPartnerAgendaPdf(input);
  const dataUri = doc.output("datauristring") as string;
  const base64 = dataUri.replace(/^data:application\/pdf;base64,/i, "");
  return { base64, filename };
}

export async function openPartnerAgendaPdf(
  input: PartnerAgendaPdfInput,
  reservedTab?: Window | null,
) {
  const tab = reservedTab && !reservedTab.closed ? reservedTab : reservePdfTab();
  const { doc, filename } = await buildPartnerAgendaPdf(input);
  openPdfInBrowser(doc, filename, tab);
}
