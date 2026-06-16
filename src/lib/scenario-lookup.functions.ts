import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import type { Medication } from "@/lib/medicare-math";

const codeSchema = z.object({ code: z.string().min(4).max(64) });

type ScenarioRow = {
  scenario_code: string;
  birth_year: number;
  zip3: string;
  gender: string | null;
  tobacco: boolean;
  income_band: string | null;
  cost_preference: string | null;
  conditions: unknown;
  medications: unknown;
  preferences: unknown;
  created_at: string;
};

function mapScenarioRow(
  row: ScenarioRow,
  extras?: { contactRequests?: Array<{ email: string; phone: string; createdAt: string }> },
) {
  const prefs = (row.preferences ?? {}) as { county?: string; requestExpertContact?: boolean };
  const year = new Date(row.created_at).getFullYear() < 2027 ? 2026 : 2027;

  return {
    scenarioCode: row.scenario_code,
    year,
    birthYear: row.birth_year,
    zip3: row.zip3,
    county: prefs.county,
    gender: row.gender ?? undefined,
    tobacco: row.tobacco,
    incomeBand: row.income_band ?? undefined,
    costPreference:
      (row.cost_preference as "minimize_monthly" | "predictability") ?? "minimize_monthly",
    conditions: (row.conditions as unknown as string[]) ?? [],
    medications: (row.medications as unknown as Medication[]) ?? [],
    requestExpertContact: prefs.requestExpertContact === true,
    contactRequests: extras?.contactRequests ?? [],
  };
}

async function fetchScenarioRow(code: string) {
  const normalized = code.trim().toUpperCase();
  const { data: row, error } = await supabaseAdmin
    .from("scenarios")
    .select(
      "scenario_code, birth_year, zip3, gender, tobacco, income_band, cost_preference, conditions, medications, preferences, created_at",
    )
    .eq("scenario_code", normalized)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) throw new Error("Scenario not found or expired");
  return row as ScenarioRow;
}

/** Public read by scenario code — no login required (de-identified data only). */
export const getPublicScenarioByCode = createServerFn({ method: "POST" })
  .inputValidator((input) => codeSchema.parse(input))
  .handler(async ({ data }) => {
    const row = await fetchScenarioRow(data.code);
    return mapScenarioRow(row);
  });

/** Staff read by code — includes admin-only contact opt-ins when applicable. */
export const getScenarioByCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => codeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (!roles || roles.length === 0) throw new Error("Not authorized");

    const row = await fetchScenarioRow(data.code);

    const isStaffAdmin = (roles ?? []).some(
      (r) => r.role === "admin" || r.role === "leads_admin",
    );
    let contactRequests: Array<{ email: string; phone: string; createdAt: string }> = [];
    if (isStaffAdmin) {
      const { data: reqs } = await supabaseAdmin
        .from("expert_contact_requests")
        .select("email, phone, created_at")
        .eq("scenario_code", row.scenario_code)
        .order("created_at", { ascending: false });
      contactRequests = (reqs ?? []).map((r) => ({
        email: r.email,
        phone: r.phone,
        createdAt: r.created_at,
      }));
    }

    return mapScenarioRow(row, { contactRequests });
  });
