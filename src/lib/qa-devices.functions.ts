import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const deviceSchema = z.array(z.string().trim().min(1).max(80)).max(20);

export const getMyQADevices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("qa_devices")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { qa_devices: (data?.qa_devices ?? []) as string[] };
  });

export const saveMyQADevices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ qa_devices: deviceSchema }).parse(input))
  .handler(async ({ data, context }) => {
    // Verify user has the qa role before allowing this self-update.
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const hasQa = (roles ?? []).some((r) => r.role === "qa");
    if (!hasQa) throw new Error("QA role required");

    const { error } = await supabaseAdmin
      .from("profiles")
      .upsert({ id: context.userId, qa_devices: data.qa_devices });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
