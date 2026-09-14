/**
 * Admin overrides for guide kit body content (prerequisites, tools, steps,
 * Supply List, and Suggested Pricing).
 * Stored in guide_catalog_state.patch_json; full ordered arrays replace code defaults.
 */
import type { GuideCatalogPatch } from "./guide-catalog-state";
import type {
  GuideAuthoredStep,
  GuideKit,
  GuidePrerequisite,
  GuideSuggestedPricing,
  GuideSupplyList,
  GuideToolCost,
} from "./guide-tools";
import { guideKitForId, stripGyshFreeAccountPrerequisite } from "./guide-tools";
import { finalizeGuidePlaybookSteps } from "./guide-detailed-steps";
import { ensureMarketingPlanSteps } from "./guide-marketing-plan";
import { hustleById } from "./side-hustle-catalog";
import { kidsGuideById } from "./kids-guides";
import type { GuidePricingItem } from "./guide-suggested-pricing";
import type { GuideSupplyItem } from "./guide-supplies";

const MAX_ITEMS = 60;
const MAX_LABEL = 200;
const MAX_TEXT = 4000;
const MAX_URL = 500;

function clip(value: string, max: number): string {
  return value.trim().slice(0, max);
}

function slugId(raw: unknown, fallback: string): string {
  const s = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return s || fallback;
}

export function newGuideKitItemId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function moveGuideKitItem<T>(items: T[], index: number, dir: -1 | 1): T[] {
  const j = index + dir;
  if (index < 0 || j < 0 || j >= items.length) return items;
  const next = items.slice();
  const tmp = next[index]!;
  next[index] = next[j]!;
  next[j] = tmp;
  return next;
}

export function sanitizeGuidePrerequisites(raw: unknown): GuidePrerequisite[] | undefined {
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw)) return undefined;
  const out: GuidePrerequisite[] = [];
  for (let i = 0; i < raw.length && out.length < MAX_ITEMS; i++) {
    const row = raw[i];
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const body = row as Record<string, unknown>;
    const label = typeof body.label === "string" ? clip(body.label, MAX_LABEL) : "";
    const detail = typeof body.detail === "string" ? clip(body.detail, MAX_TEXT) : "";
    if (!label && !detail) continue;
    out.push({
      id: slugId(body.id, `prereq-${out.length + 1}`),
      label: label || `Prerequisite ${out.length + 1}`,
      detail,
    });
  }
  return stripGyshFreeAccountPrerequisite(out);
}

export function sanitizeGuideTools(raw: unknown): GuideToolCost[] | undefined {
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw)) return undefined;
  const out: GuideToolCost[] = [];
  for (let i = 0; i < raw.length && out.length < MAX_ITEMS; i++) {
    const row = raw[i];
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const body = row as Record<string, unknown>;
    const name = typeof body.name === "string" ? clip(body.name, MAX_LABEL) : "";
    if (!name) continue;
    const tool: GuideToolCost = {
      id: slugId(body.id, `tool-${out.length + 1}`),
      name,
      freePlanAvailable: body.freePlanAvailable === true,
      costNote:
        typeof body.costNote === "string" ? clip(body.costNote, MAX_TEXT) : "",
    };
    if (typeof body.url === "string" && body.url.trim()) {
      tool.url = clip(body.url, MAX_URL);
    }
    if (typeof body.alternatives === "string" && body.alternatives.trim()) {
      tool.alternatives = clip(body.alternatives, MAX_TEXT);
    }
    if (body.optional === true) tool.optional = true;
    if (body.planLabelApplicable === false) tool.planLabelApplicable = false;
    out.push(tool);
  }
  return out;
}

export function sanitizeGuideSteps(raw: unknown): GuideAuthoredStep[] | undefined {
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw)) return undefined;
  const out: GuideAuthoredStep[] = [];
  for (let i = 0; i < raw.length && out.length < MAX_ITEMS; i++) {
    const row = raw[i];
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const body = row as Record<string, unknown>;
    const title = typeof body.title === "string" ? clip(body.title, MAX_LABEL) : "";
    const desc = typeof body.desc === "string" ? clip(body.desc, MAX_TEXT) : "";
    if (!title && !desc) continue;
    out.push({
      title: title || `Step ${out.length + 1}`,
      desc,
    });
  }
  return out;
}

export function sanitizeGuideSupplyItems(raw: unknown): GuideSupplyItem[] | undefined {
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw)) return undefined;
  const out: GuideSupplyItem[] = [];
  for (let i = 0; i < raw.length && out.length < MAX_ITEMS; i++) {
    const row = raw[i];
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const body = row as Record<string, unknown>;
    const name = typeof body.name === "string" ? clip(body.name, MAX_LABEL) : "";
    if (!name) continue;
    const item: GuideSupplyItem = {
      id: slugId(body.id, `supply-${out.length + 1}`),
      name,
      qty: typeof body.qty === "string" ? clip(body.qty, 80) : "1",
      estCost: typeof body.estCost === "string" ? clip(body.estCost, 80) : "",
    };
    if (typeof body.notes === "string" && body.notes.trim()) {
      item.notes = clip(body.notes, MAX_TEXT);
    }
    if (body.optional === true) item.optional = true;
    out.push(item);
  }
  return out;
}

export function sanitizeGuideSupplies(raw: unknown): GuideSupplyList | undefined {
  if (raw === undefined) return undefined;
  if (raw === null) return undefined;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const body = raw as Record<string, unknown>;
  const items = sanitizeGuideSupplyItems(body.items);
  if (items === undefined) return undefined;
  return {
    items,
    starterKitTotal:
      typeof body.starterKitTotal === "string" ? clip(body.starterKitTotal, MAX_TEXT) : "",
  };
}

export function sanitizeGuidePricingItems(raw: unknown): GuidePricingItem[] | undefined {
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw)) return undefined;
  const out: GuidePricingItem[] = [];
  for (let i = 0; i < raw.length && out.length < MAX_ITEMS; i++) {
    const row = raw[i];
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const body = row as Record<string, unknown>;
    const label = typeof body.label === "string" ? clip(body.label, MAX_LABEL) : "";
    const price = typeof body.price === "string" ? clip(body.price, MAX_LABEL) : "";
    if (!label && !price) continue;
    const item: GuidePricingItem = {
      id: slugId(body.id, `price-${out.length + 1}`),
      label: label || `Price ${out.length + 1}`,
      price: price || "",
    };
    if (typeof body.notes === "string" && body.notes.trim()) {
      item.notes = clip(body.notes, MAX_TEXT);
    }
    out.push(item);
  }
  return out;
}

export function sanitizeGuideSuggestedPricing(raw: unknown): GuideSuggestedPricing | undefined {
  if (raw === undefined) return undefined;
  if (raw === null) return undefined;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const body = raw as Record<string, unknown>;
  const items = sanitizeGuidePricingItems(body.items);
  if (items === undefined) return undefined;
  const out: GuideSuggestedPricing = { items };
  if (typeof body.raiseTip === "string" && body.raiseTip.trim()) {
    out.raiseTip = clip(body.raiseTip, MAX_TEXT);
  }
  if (typeof body.intro === "string" && body.intro.trim()) {
    out.intro = clip(body.intro, MAX_TEXT);
  }
  if (typeof body.tabLabel === "string" && body.tabLabel.trim()) {
    out.tabLabel = clip(body.tabLabel, MAX_LABEL);
  }
  return out;
}

/** Merge kit-body fields from a raw patch object into a GuideCatalogPatch. */
export function mergeKitFieldsIntoPatch(
  patch: GuideCatalogPatch,
  raw: Record<string, unknown>,
): GuideCatalogPatch {
  const next = { ...patch };
  if ("prerequisites" in raw) {
    if (raw.prerequisites === null) delete next.prerequisites;
    else {
      const list = sanitizeGuidePrerequisites(raw.prerequisites);
      if (list !== undefined) next.prerequisites = list;
    }
  }
  if ("tools" in raw) {
    if (raw.tools === null) delete next.tools;
    else {
      const list = sanitizeGuideTools(raw.tools);
      if (list !== undefined) next.tools = list;
    }
  }
  if ("steps" in raw) {
    if (raw.steps === null) delete next.steps;
    else {
      const list = sanitizeGuideSteps(raw.steps);
      if (list !== undefined) next.steps = list;
    }
  }
  if ("supplies" in raw) {
    if (raw.supplies === null) delete next.supplies;
    else {
      const list = sanitizeGuideSupplies(raw.supplies);
      if (list !== undefined) next.supplies = list;
    }
  }
  if ("suggestedPricing" in raw) {
    if (raw.suggestedPricing === null) delete next.suggestedPricing;
    else {
      const list = sanitizeGuideSuggestedPricing(raw.suggestedPricing);
      if (list !== undefined) next.suggestedPricing = list;
    }
  }
  return next;
}

/**
 * Apply admin catalog patch onto a resolved kit.
 * Present arrays (including empty) replace that slice; undefined keeps code defaults.
 */
export function applyGuideKitPatch(
  base: GuideKit,
  patch?: GuideCatalogPatch | null,
): GuideKit {
  if (!patch) return base;
  const next: GuideKit = { ...base };
  if (patch.prerequisites !== undefined) {
    next.prerequisites = patch.prerequisites.map((p) => ({ ...p }));
  }
  if (patch.tools !== undefined) {
    next.tools = patch.tools.map((t) => ({ ...t }));
  }
  if (patch.steps !== undefined) {
    next.steps = patch.steps.map((s) => ({ title: s.title, desc: s.desc }));
  }
  if (patch.supplies !== undefined) {
    next.supplies = {
      starterKitTotal: patch.supplies.starterKitTotal,
      items: patch.supplies.items.map((i) => ({ ...i })),
    };
  }
  if (patch.suggestedPricing !== undefined) {
    next.suggestedPricing = {
      items: patch.suggestedPricing.items.map((i) => ({ ...i })),
      ...(patch.suggestedPricing.raiseTip
        ? { raiseTip: patch.suggestedPricing.raiseTip }
        : {}),
      ...(patch.suggestedPricing.intro ? { intro: patch.suggestedPricing.intro } : {}),
      ...(patch.suggestedPricing.tabLabel
        ? { tabLabel: patch.suggestedPricing.tabLabel }
        : {}),
    };
  }
  return next;
}

export function guideKitHasContentOverride(patch?: GuideCatalogPatch | null): boolean {
  if (!patch) return false;
  return (
    patch.prerequisites !== undefined ||
    patch.tools !== undefined ||
    patch.steps !== undefined ||
    patch.supplies !== undefined ||
    patch.suggestedPricing !== undefined
  );
}

/** Resolve kit for a guide, applying admin overrides when present. */
export function resolveGuideKit(
  guideId: string,
  patch?: GuideCatalogPatch | null,
): GuideKit {
  const kit = applyGuideKitPatch(guideKitForId(guideId), patch);
  kit.prerequisites = stripGyshFreeAccountPrerequisite(kit.prerequisites);
  /** Admin/QA Steps tab saves are authoritative — do not re-inject deleted foundation/marketing steps. */
  if (patch?.steps !== undefined) {
    return {
      ...kit,
      steps: (kit.steps ?? []).map((s) => ({ title: s.title, desc: s.desc })),
    };
  }
  const hustle = hustleById(guideId);
  const kids = hustle ? undefined : kidsGuideById(guideId);
  const audiences =
    hustle?.audiences ??
    (kids
      ? kids.audience === "junior"
        ? (["junior"] as const)
        : (["kids"] as const)
      : undefined);
  const steps = finalizeGuidePlaybookSteps(
    guideId,
    ensureMarketingPlanSteps(kit.steps ?? [], guideId),
    { audiences },
  );
  return { ...kit, steps };
}
