import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { EDITORIAL_CALENDAR_TEAM_USER_ID } from "@/lib/content-factory/editorial-calendar-progress.server";
import {
  mergeSubmissionChecklistStates,
  parseSubmissionChecklistStatePayload,
  prepareSubmissionChecklistStateForServer,
  submissionChecklistErrorMessage,
  type SubmissionChecklistState,
} from "@/lib/submission-checklist-storage";
import { SUBMISSION_CHECKLIST_ID } from "@/lib/submission-checklist-data";

/** Shared row — same system user as editorial calendar (already in auth.users). */
export const SUBMISSION_CHECKLIST_TEAM_USER_ID = EDITORIAL_CALENDAR_TEAM_USER_ID;

function throwChecklistDbError(error: { message: string }): never {
  throw new Error(submissionChecklistErrorMessage(error));
}

export async function loadSubmissionChecklistProgressFromDb(): Promise<SubmissionChecklistState | null> {
  const { data, error } = await supabaseAdmin
    .from("submission_checklist_progress" as any)
    .select("state, updated_at")
    .eq("user_id", SUBMISSION_CHECKLIST_TEAM_USER_ID)
    .eq("checklist_id", SUBMISSION_CHECKLIST_ID)
    .maybeSingle();

  if (error) throwChecklistDbError(error);
  if (!data?.state) return null;

  const parsed = parseSubmissionChecklistStatePayload(data.state);
  if (!parsed) return null;
  const stripped = prepareSubmissionChecklistStateForServer(parsed);
  return {
    ...stripped,
    updatedAt: data.updated_at ?? parsed.updatedAt,
  };
}

export async function saveSubmissionChecklistProgressToDb(
  state: SubmissionChecklistState,
): Promise<SubmissionChecklistState> {
  const stripped = prepareSubmissionChecklistStateForServer(state);
  const next: SubmissionChecklistState = {
    ...stripped,
    updatedAt: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin.from("submission_checklist_progress" as any).upsert(
    {
      user_id: SUBMISSION_CHECKLIST_TEAM_USER_ID,
      checklist_id: SUBMISSION_CHECKLIST_ID,
      state: next,
      updated_at: next.updatedAt,
    },
    { onConflict: "user_id" },
  );

  if (error) throwChecklistDbError(error);
  return next;
}

export async function mergeSubmissionChecklistProgressInDb(
  incoming: SubmissionChecklistState,
): Promise<SubmissionChecklistState> {
  const current = (await loadSubmissionChecklistProgressFromDb()) ?? incoming;
  const merged = mergeSubmissionChecklistStates(current, incoming);
  return saveSubmissionChecklistProgressToDb(merged);
}
