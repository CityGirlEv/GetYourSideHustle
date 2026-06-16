import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  brandRecoveryConfirmationUrl,
  passwordRecoveryRedirectUrl,
} from "@/lib/auth-recovery";

/** True when the user has never set a password through registration or reset. */
export function userNeedsPasswordSetup(passwordConfirmedAt: string | null | undefined): boolean {
  return !passwordConfirmedAt;
}

export async function fetchPasswordConfirmedAt(userId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("password_confirmed_at")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.password_confirmed_at ?? null;
}

export async function markPasswordConfirmed(userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("profiles")
    .upsert({ id: userId, password_confirmed_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

/** Branded recovery link so enabled legacy users can set a password in one click. */
export async function generateBrandedRecoveryLink(email: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: passwordRecoveryRedirectUrl() },
  });
  if (error || !data?.properties?.action_link) {
    console.warn("[password-status] recovery link generation failed", error?.message);
    return null;
  }
  return brandRecoveryConfirmationUrl(data.properties.action_link);
}
