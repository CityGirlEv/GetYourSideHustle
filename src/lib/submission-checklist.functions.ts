import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { verifyStaffAdmin } from "@/lib/staff-admin.server";
import {
  parseSubmissionChecklistStatePayload,
  clearedSubmissionChecklistState,
  type SubmissionChecklistState,
} from "@/lib/submission-checklist-storage";

const stateSchema = z.record(z.string(), z.unknown());

export const loadSubmissionChecklistProgressAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyStaffAdmin(context.userId);
    const { loadSubmissionChecklistProgressFromDb } = await import(
      "@/lib/submission-checklist-progress.server"
    );
    return loadSubmissionChecklistProgressFromDb();
  });

export const saveSubmissionChecklistProgressAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        state: stateSchema,
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await verifyStaffAdmin(context.userId);
    const parsed = parseSubmissionChecklistStatePayload(data.state);
    if (!parsed) throw new Error("Invalid checklist state payload");
    const { saveSubmissionChecklistProgressToDb } = await import(
      "@/lib/submission-checklist-progress.server"
    );
    return saveSubmissionChecklistProgressToDb(parsed);
  });

export const mergeSubmissionChecklistProgressAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        state: stateSchema,
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await verifyStaffAdmin(context.userId);
    const parsed = parseSubmissionChecklistStatePayload(data.state);
    if (!parsed) throw new Error("Invalid checklist state payload");
    const { mergeSubmissionChecklistProgressInDb } = await import(
      "@/lib/submission-checklist-progress.server"
    );
    return mergeSubmissionChecklistProgressInDb(parsed);
  });

export const resetSubmissionChecklistProgressAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyStaffAdmin(context.userId);
    const { saveSubmissionChecklistProgressToDb } = await import(
      "@/lib/submission-checklist-progress.server"
    );
    return saveSubmissionChecklistProgressToDb(clearedSubmissionChecklistState());
  });

export type { SubmissionChecklistState };
