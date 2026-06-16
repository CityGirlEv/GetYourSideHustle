import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  fetchPasswordConfirmedAt,
  markPasswordConfirmed,
  userNeedsPasswordSetup,
} from "@/lib/password-status.server";

export const getPasswordRecoverySetupStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("password_confirmed_at, qa_devices")
        .eq("id", context.userId)
        .maybeSingle(),
      supabaseAdmin.from("user_roles").select("role").eq("user_id", context.userId),
    ]);

    const isQa = (roles ?? []).some((r) => r.role === "qa");
    const needsPasswordSetup = userNeedsPasswordSetup(profile?.password_confirmed_at);

    return {
      needs_device_prefs: isQa && needsPasswordSetup,
      qa_devices: (profile?.qa_devices ?? []) as string[],
      is_qa: isQa,
      needs_password_setup: needsPasswordSetup,
    };
  });

export const confirmPasswordSet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const existing = await fetchPasswordConfirmedAt(context.userId);
    if (!existing) {
      await markPasswordConfirmed(context.userId);
    }
    return { ok: true as const };
  });
