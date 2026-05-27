// ============================================================================
// CUSTOM TESTS
// ----------------------------------------------------------------------------
// User-created tests (admin/qa). Persisted in the custom_tests Supabase table.
// New tests default to assignee="Unassigned" and sprint="" so they appear in
// the "Unassigned" group on the testing portal until an admin assigns them.
// ============================================================================
import { supabase } from "@/integrations/supabase/client";
import type { TestCase, Priority } from "@/lib/test-plan";

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

function nextId(existingIds: string[]): string {
  let max = 0;
  for (const id of existingIds) {
    const m = /^CUS-(\d+)$/.exec(id);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `CUS-${String(max + 1).padStart(3, "0")}`;
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

export async function createCustomTest(input: CreateCustomTestInput, existingIds: string[]): Promise<CustomTestRow> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) throw new Error("Not signed in");

  const row = {
    id: nextId(existingIds),
    area: input.area.trim() || "Uncategorized",
    title: input.title.trim(),
    priority: input.priority,
    preconditions: input.preconditions?.trim() || null,
    steps: input.steps.map((s) => s.trim()).filter(Boolean),
    expected: input.expected.trim(),
    notes: input.notes?.trim() || null,
    assignee: null,      // → renders as "Unassigned"
    sprint_id: null,     // → renders in the "Unassigned" sprint group
    created_by: uid,
  };

  const { data, error } = await supabase
    .from("custom_tests")
    .insert(row)
    .select("*")
    .single();
  if (error) throw error;
  return data as CustomTestRow;
}

export async function deleteCustomTest(id: string): Promise<void> {
  const { error } = await supabase.from("custom_tests").delete().eq("id", id);
  if (error) throw error;
}