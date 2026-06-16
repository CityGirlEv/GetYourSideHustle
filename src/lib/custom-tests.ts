// ============================================================================
// CUSTOM TESTS
// ----------------------------------------------------------------------------
// User-created tests (admin/qa). Persisted in the custom_tests Supabase table.
// New tests default to assignee="Unassigned" and sprint_id=ACTIVE_SPRINT_ID
// so they land in the current sprint, unassigned, until an admin picks them up.
// ============================================================================
import { supabase } from "@/integrations/supabase/client";
import type { TestCase, Priority, TestDescriptionOverride } from "@/lib/test-plan";
import { ACTIVE_SPRINT_ID } from "@/lib/test-plan";
import { resolveTestContentId } from "@/lib/platform-variants";

/** Primary owner account for Testing Portal content edits (steps, descriptions, duplicates). */
export const TESTING_PORTAL_OWNER_EMAIL = "evelyn3@cox.net";

/** @deprecated Use {@link TESTING_PORTAL_OWNER_EMAIL} */
export const DUPLICATE_TEST_ALLOWED_EMAIL = TESTING_PORTAL_OWNER_EMAIL;

export function isTestingPortalOwner(email: string | null | undefined): boolean {
  return (email ?? "").trim().toLowerCase() === TESTING_PORTAL_OWNER_EMAIL;
}

export function canDuplicateTests(email: string | null | undefined): boolean {
  return isTestingPortalOwner(email);
}

/** Edit test titles, steps, and expected results in the Testing Portal. */
export function canEditTestPlanContent(email: string | null | undefined): boolean {
  return isTestingPortalOwner(email);
}

export interface CustomTestRow {
  id: string;
  area: string;
  title: string;
  priority: Priority;
  preconditions: string | null;
  steps: string[];
  expected: string;
  notes: string | null;
  assignee: string | null;
  sprint_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function customRowToTestCase(r: CustomTestRow): TestCase & { isCustom: true } {
  return {
    id: r.id,
    area: r.area,
    title: r.title,
    priority: r.priority,
    preconditions: r.preconditions ?? undefined,
    steps: Array.isArray(r.steps) ? r.steps : [],
    expected: r.expected ?? "",
    notes: r.notes ?? undefined,
    assignee: r.assignee ?? "Unassigned",
    sprintId: r.sprint_id ?? "",
    isCustom: true as const,
  };
}

export async function listCustomTests(): Promise<CustomTestRow[]> {
  const { data, error } = await supabase
    .from("custom_tests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CustomTestRow[];
}

/** Next CUS-### id from any test ids (incl. platform variants like CUS-001-PHONE). */
export function nextCustomTestId(existingIds: string[]): string {
  let max = 0;
  for (const id of existingIds) {
    const base = resolveTestContentId(id);
    const m = /^CUS-(\d+)$/.exec(base);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `CUS-${String(max + 1).padStart(3, "0")}`;
}

async function allKnownCustomTestIds(extra: string[] = []): Promise<string[]> {
  const { data, error } = await supabase.from("custom_tests").select("id");
  if (error) throw error;
  return [...new Set([...(data ?? []).map((r) => r.id), ...extra])];
}

export interface CreateCustomTestInput {
  area: string;
  title: string;
  priority: Priority;
  preconditions?: string;
  steps: string[];
  expected: string;
  notes?: string;
}

export async function createCustomTest(
  input: CreateCustomTestInput,
  existingIds: string[] = [],
): Promise<CustomTestRow> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) throw new Error("Not signed in");

  const ids = await allKnownCustomTestIds(existingIds);
  const row = {
    id: nextCustomTestId(ids),
    area: input.area.trim() || "Uncategorized",
    title: input.title.trim(),
    priority: input.priority,
    preconditions: input.preconditions?.trim() || null,
    steps: input.steps.map((s) => s.trim()).filter(Boolean),
    expected: input.expected.trim(),
    notes: input.notes?.trim() || null,
    assignee: null, // → renders as "Unassigned"
    sprint_id: ACTIVE_SPRINT_ID, // → lands in the current sprint
    created_by: uid,
  };

  const { data, error } = await supabase.from("custom_tests").insert(row).select("*").single();
  if (error) throw error;
  return data as CustomTestRow;
}

/**
 * Duplicate any test (manual TEST_CASES entry, auto-discovered Vitest/Playwright
 * entry, or another custom test) into a new custom_tests row. Use this to add
 * additional coverage for the same scenario — the copy gets a fresh CUS-### id
 * and lands in "Unassigned" until an admin re-assigns it.
 */
export async function duplicateCustomTest(
  source: TestCase,
  existingIds: string[],
): Promise<CustomTestRow> {
  const { data: auth } = await supabase.auth.getUser();
  if (!canDuplicateTests(auth?.user?.email)) {
    throw new Error("You do not have permission to duplicate tests.");
  }
  return createCustomTest(
    {
      area: source.area,
      title: `${source.title} (copy)`,
      priority: source.priority,
      preconditions: source.preconditions ?? "",
      steps: source.steps,
      expected: source.expected,
      notes: source.notes ?? `Duplicated from ${source.id}`,
    },
    existingIds,
  );
}

export async function deleteCustomTest(id: string): Promise<void> {
  const { error } = await supabase.from("custom_tests").delete().eq("id", id);
  if (error) throw error;
}

export async function updateCustomTestContent(
  id: string,
  ov: TestDescriptionOverride,
): Promise<boolean> {
  const { data: auth } = await supabase.auth.getUser();
  if (!canEditTestPlanContent(auth?.user?.email)) {
    throw new Error("You do not have permission to edit tests.");
  }

  const steps = (ov.steps ?? []).map((s) => s.trim()).filter(Boolean);
  if (!ov.title?.trim()) throw new Error("Title is required.");
  if (!steps.length) throw new Error("At least one step is required.");
  if (!ov.expected?.trim()) throw new Error("Expected result is required.");

  const patch = {
    title: ov.title.trim(),
    preconditions: ov.preconditions?.trim() || null,
    steps,
    expected: ov.expected.trim(),
    notes: ov.notes?.trim() || null,
  };

  const { error } = await supabase.from("custom_tests").update(patch).eq("id", id);
  if (error) {
    console.warn("[custom-tests] updateCustomTestContent", error.message);
    try {
      const { toast } = await import("sonner");
      toast.error("Couldn't save test to database", { description: error.message });
    } catch {
      /* noop */
    }
    return false;
  }
  return true;
}
