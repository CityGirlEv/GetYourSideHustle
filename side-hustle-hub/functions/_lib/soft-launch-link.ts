/**
 * Deterministic Content Factory item ↔ Task List id mapping.
 * Must stay in sync with src/lib/gysh-soft-launch-rollout.ts softLaunchTaskId.
 */

/** Task id for a soft-launch / Content Factory calendar item. */
export function softLaunchTaskId(itemId: string): string {
  const raw = String(itemId || "").trim();
  if (!raw) return "";
  return `T-${raw
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

/**
 * Reverse map soft-launch Task List ids (T-SL-…) → calendar item slug.
 * Returns null for non–soft-launch tasks.
 */
export function softLaunchItemIdFromTaskId(taskId: string): string | null {
  const t = String(taskId || "").trim().toUpperCase();
  if (!t.startsWith("T-SL-")) return null;
  return t.slice(2).toLowerCase();
}
