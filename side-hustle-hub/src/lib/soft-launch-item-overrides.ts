/**
 * Client-side merge of Content Factory calendar item overrides over the code catalog.
 */
import { api } from "./api";
import {
  SOFT_LAUNCH_ROLLOUT,
  registerSoftLaunchItemOverlay,
  type RolloutChannel,
  type RolloutOwner,
  type SoftLaunchItem,
  type SoftLaunchItemStatus,
} from "./gysh-soft-launch-rollout";

export type SoftLaunchItemPatch = {
  sprint?: 2 | 3 | 4 | 5;
  day?: string;
  channel?: RolloutChannel;
  title?: string;
  owner?: RolloutOwner;
  postTime?: string | null;
  copy?: string | null;
  imagePrompt?: string | null;
  videoPrompt?: string | null;
  hedraStartImagePrompt?: string | null;
  hedraVideoPrompt?: string | null;
  relatedTestIds?: string[] | null;
  artifacts?: string[] | null;
  websiteActions?: string[] | null;
  notes?: string | null;
  /** Explicit CF status — same values as Task List. Null clears back to auto. */
  status?: SoftLaunchItemStatus | null;
};

export type SoftLaunchOverrideEntry = {
  patch: SoftLaunchItemPatch;
  updatedAt?: string;
  updatedBy?: string;
};

function applyNullableString<T extends string>(
  base: T | undefined,
  patch: string | null | undefined,
): T | undefined {
  if (patch === undefined) return base;
  // null clears an override field; empty string keeps the catalog default
  // so new catalog Copy/prompts still show after a blank save.
  if (patch === null) return undefined;
  if (patch === "") return base;
  return patch as T;
}

function normalizeStatusPatch(patch: SoftLaunchItemPatch): SoftLaunchItemStatus | null | undefined {
  if ("status" in patch) {
    if (patch.status === null) return null;
    if (
      patch.status === "not_started" ||
      patch.status === "in_progress" ||
      patch.status === "blocked" ||
      patch.status === "done"
    ) {
      return patch.status;
    }
  }
  // Legacy fields from earlier iterations
  const legacy = patch as SoftLaunchItemPatch & {
    cfStatus?: string | null;
    markedDone?: boolean | null;
  };
  if (legacy.cfStatus === "done" || legacy.markedDone === true) return "done";
  if (legacy.cfStatus === "open") return "not_started";
  if (legacy.cfStatus === null || legacy.markedDone === false) return null;
  return undefined;
}

export function applySoftLaunchItemPatch(
  base: SoftLaunchItem,
  patch?: SoftLaunchItemPatch | null,
): SoftLaunchItem {
  if (!patch || Object.keys(patch).length === 0) return base;
  const next: SoftLaunchItem = { ...base };

  if (patch.sprint === 2 || patch.sprint === 3 || patch.sprint === 4 || patch.sprint === 5) {
    next.sprint = patch.sprint;
  }
  if (typeof patch.day === "string" && patch.day) next.day = patch.day;
  if (patch.channel) next.channel = patch.channel;
  if (typeof patch.title === "string" && patch.title.trim()) next.title = patch.title.trim();
  if (patch.owner) next.owner = patch.owner;

  next.postTime = applyNullableString(base.postTime, patch.postTime);
  next.copy = applyNullableString(base.copy, patch.copy);
  next.imagePrompt = applyNullableString(base.imagePrompt, patch.imagePrompt);
  next.videoPrompt = applyNullableString(base.videoPrompt, patch.videoPrompt);
  next.hedraStartImagePrompt = applyNullableString(
    base.hedraStartImagePrompt,
    patch.hedraStartImagePrompt,
  );
  next.hedraVideoPrompt = applyNullableString(base.hedraVideoPrompt, patch.hedraVideoPrompt);
  next.notes = applyNullableString(base.notes, patch.notes);

  if (patch.relatedTestIds !== undefined) {
    next.relatedTestIds = patch.relatedTestIds ?? undefined;
  }
  if (patch.artifacts !== undefined) {
    next.artifacts = patch.artifacts ?? [];
  }
  if (patch.websiteActions !== undefined) {
    next.websiteActions = patch.websiteActions ?? undefined;
  }

  const status = normalizeStatusPatch(patch);
  if (status === null) delete next.status;
  else if (status !== undefined) next.status = status;

  return next;
}

export function mergeSoftLaunchRollout(
  overrides: Record<string, SoftLaunchItemPatch | SoftLaunchOverrideEntry | undefined>,
  catalog: SoftLaunchItem[] = SOFT_LAUNCH_ROLLOUT,
): SoftLaunchItem[] {
  return catalog.map((item) => {
    const entry = overrides[item.id];
    const patch = entry && "patch" in entry ? entry.patch : (entry as SoftLaunchItemPatch | undefined);
    return applySoftLaunchItemPatch(item, patch);
  });
}

export function patchesFromOverridePayload(
  overrides: Record<string, SoftLaunchOverrideEntry | SoftLaunchItemPatch>,
): Record<string, SoftLaunchItemPatch> {
  const out: Record<string, SoftLaunchItemPatch> = {};
  for (const [id, entry] of Object.entries(overrides)) {
    if (!entry) continue;
    out[id] = "patch" in entry ? entry.patch : (entry as SoftLaunchItemPatch);
  }
  return out;
}

export async function fetchSoftLaunchOverrides(): Promise<
  Record<string, SoftLaunchOverrideEntry>
> {
  const data = await api<{ overrides: Record<string, SoftLaunchOverrideEntry> }>(
    "soft-launch-overrides",
  );
  return data.overrides ?? {};
}

export async function saveSoftLaunchItemOverride(
  itemId: string,
  patch: SoftLaunchItemPatch,
  opts?: { replace?: boolean },
): Promise<SoftLaunchOverrideEntry> {
  const data = await api<{
    ok: boolean;
    itemId: string;
    patch: SoftLaunchItemPatch;
    updatedAt: string;
    updatedBy: string;
  }>("soft-launch-overrides", {
    method: "PUT",
    body: { itemId, patch, replace: opts?.replace === true },
  });
  return {
    patch: data.patch,
    updatedAt: data.updatedAt,
    updatedBy: data.updatedBy,
  };
}

export async function resetSoftLaunchItemOverride(itemId: string): Promise<void> {
  await api("soft-launch-overrides", {
    method: "DELETE",
    body: { itemId },
  });
}

/** Lines ↔ string[] for textarea editing. */
export function linesToList(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function listToLines(list: string[] | undefined | null): string {
  return (list ?? []).join("\n");
}

/** Activate live overlay so softLaunchItemById / FromTestId see D1 patches. */
export function activateSoftLaunchOverrides(
  overrides: Record<string, SoftLaunchItemPatch | SoftLaunchOverrideEntry | undefined>,
): void {
  const patches = patchesFromOverridePayload(
    overrides as Record<string, SoftLaunchOverrideEntry | SoftLaunchItemPatch>,
  );
  if (Object.keys(patches).length === 0) {
    registerSoftLaunchItemOverlay(null);
    return;
  }
  registerSoftLaunchItemOverlay((base) => applySoftLaunchItemPatch(base, patches[base.id]));
}
