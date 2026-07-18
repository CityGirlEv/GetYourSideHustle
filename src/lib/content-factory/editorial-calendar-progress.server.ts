import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** Shared checklist row — all content admins read/write the same completions. */
export const EDITORIAL_CALENDAR_TEAM_USER_ID = "00000000-0000-0000-0000-000000000001";

function normalizeCompletedTasks(tasks: unknown): Record<string, boolean> {
  if (!tasks || typeof tasks !== "object" || Array.isArray(tasks)) return {};
  const out: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(tasks as Record<string, unknown>)) {
    if (value === true) out[key] = true;
  }
  return out;
}

/** Union completed task maps from multiple DB rows (team + legacy per-user rows). */
export function mergeCompletedTaskRows(
  rows: Array<{ completed_tasks: unknown }>,
): Record<string, boolean> {
  const merged: Record<string, boolean> = {};
  for (const row of rows) {
    for (const [key, value] of Object.entries(normalizeCompletedTasks(row.completed_tasks))) {
      if (value) merged[key] = true;
    }
  }
  return merged;
}

export async function loadEditorialCalendarProgressFromDb(): Promise<Record<string, boolean>> {
  const { data, error } = await supabaseAdmin
    .from("editorial_calendar_progress" as any)
    .select("user_id, completed_tasks");

  if (error) throw new Error(error.message);
  return mergeCompletedTaskRows(data ?? []);
}

export async function saveEditorialCalendarProgressToDb(
  completedTasks: Record<string, boolean>,
): Promise<Record<string, boolean>> {
  const normalized: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(completedTasks)) {
    if (value === true) normalized[key] = true;
  }

  const { error } = await supabaseAdmin.from("editorial_calendar_progress" as any).upsert(
    {
      user_id: EDITORIAL_CALENDAR_TEAM_USER_ID,
      completed_tasks: normalized,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) throw new Error(error.message);
  return normalized;
}

export async function setEditorialCalendarTaskInDb(
  storageId: string,
  completed: boolean,
): Promise<Record<string, boolean>> {
  const current = await loadEditorialCalendarProgressFromDb();
  const next = { ...current };
  if (completed) next[storageId] = true;
  else delete next[storageId];
  return saveEditorialCalendarProgressToDb(next);
}

/** Union local + server tasks; team copy is replaced with the merged set. */
export async function mergeEditorialCalendarProgressInDb(
  incoming: Record<string, boolean>,
): Promise<Record<string, boolean>> {
  const current = await loadEditorialCalendarProgressFromDb();
  const merged = { ...current };
  for (const [key, value] of Object.entries(incoming)) {
    if (value === true) merged[key] = true;
    else delete merged[key];
  }
  return saveEditorialCalendarProgressToDb(merged);
}
