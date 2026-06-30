import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { verifyStaffAdmin } from "@/lib/staff-admin.server";
import type { MedicareAd } from "@/types/MedicareAd";
import type { ScoutingSourceId } from "@/types/scouting-report";

const sourceSchema = z.enum(["facebook", "tiktok", "web"]);

export const getScoutingSourceAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ source: sourceSchema }).parse(input))
  .handler(async ({ context, data }) => {
    await verifyStaffAdmin(context.userId);
    const { fetchScoutingSource } = await import("@/lib/scouting.server");
    return fetchScoutingSource(data.source as ScoutingSourceId);
  });

export const getScoutingDataAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyStaffAdmin(context.userId);
    const { loadScoutingData } = await import("@/lib/scouting.server");
    return loadScoutingData();
  });

export const buildScoutingReportAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ ads: z.array(z.custom<MedicareAd>()) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await verifyStaffAdmin(context.userId);
    const { buildScoutingReport } = await import("@/lib/scouting-research");
    return buildScoutingReport(data.ads);
  });
