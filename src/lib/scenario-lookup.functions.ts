import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import type { Medication } from "@/lib/medicare-math";

export const getScenarioByCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ code: z.string().min(4).max(64) }).parse(input)
  )
  .handler(async ({ data, context }) => {
    // Only allow staff roles (admin, agent, advisor, qa, editor, viewer) to read by code
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (!roles || roles.length === 0) throw new Error("Not authorized");

    const { data: row, error } = await supabaseAdmin
      .from("scenarios")
      .select("scenario_code, birth_year, zip3, gender, tobacco, income_band, cost_preference, conditions, medications, preferences, created_at")
      .eq("scenario_code", data.code.trim().toUpperCase())
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Scenario not found");

    const prefs = (row.preferences ?? {}) as { county?: string };
    const year = new Date(row.created_at).getFullYear() < 2027 ? 2026 : 2027;

    // If the viewer is an admin, include any opt-in contact requests linked
    // to this scenario code so they can reach the consumer.
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    let contactRequests: Array<{ email: string; phone: string; createdAt: string }> = [];
    if (isAdmin) {
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

    return {
      scenarioCode: row.scenario_code,
      year,
      birthYear: row.birth_year,
      zip3: row.zip3,
      county: prefs.county,
      gender: row.gender ?? undefined,
      tobacco: row.tobacco,
      incomeBand: row.income_band ?? undefined,
      costPreference: (row.cost_preference as "minimize_monthly" | "predictability") ?? "minimize_monthly",
      conditions: (row.conditions as unknown as string[]) ?? [],
      medications: (row.medications as unknown as Medication[]) ?? [],
      contactRequests,
    };
  });