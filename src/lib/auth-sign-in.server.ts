import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getRuntimeConfig, getRuntimeSecret } from "@/lib/env";

export const ACCOUNT_STATUS_PENDING = "pending_approval" as const;
export const ACCOUNT_STATUS_ACTIVE = "active" as const;
export const ACCOUNT_STATUS_ADMIN_DISABLED = "admin_disabled" as const;

export type AccountAccessState =
  | typeof ACCOUNT_STATUS_ACTIVE
  | typeof ACCOUNT_STATUS_PENDING
  | typeof ACCOUNT_STATUS_ADMIN_DISABLED;

type AuthUserLookup = {
  banned_until?: string | null;
  last_sign_in_at?: string | null;
  app_metadata?: Record<string, unknown> | null;
};

export function isUserBanActive(bannedUntil: string | null | undefined): boolean {
  if (!bannedUntil) return false;
  return new Date(bannedUntil).getTime() > Date.now();
}

export function inferAccountAccessState(user: AuthUserLookup): AccountAccessState {
  if (!isUserBanActive(user.banned_until)) {
    return ACCOUNT_STATUS_ACTIVE;
  }

  const status = user.app_metadata?.account_status;
  if (status === ACCOUNT_STATUS_PENDING) return ACCOUNT_STATUS_PENDING;
  if (status === ACCOUNT_STATUS_ADMIN_DISABLED) return ACCOUNT_STATUS_ADMIN_DISABLED;

  // Legacy accounts created before account_status metadata existed.
  if (!user.last_sign_in_at) return ACCOUNT_STATUS_PENDING;
  return ACCOUNT_STATUS_ADMIN_DISABLED;
}

export function signInBlockMessageForState(state: AccountAccessState): string {
  switch (state) {
    case ACCOUNT_STATUS_PENDING:
      return "Pending approval. Your account is registered but not enabled yet. An administrator must approve your access before you can sign in.";
    case ACCOUNT_STATUS_ADMIN_DISABLED:
      return "Your account has been disabled. Contact an administrator if you need access restored.";
    default:
      return "You cannot sign in with this account. Contact an administrator for help.";
  }
}

export function isSupabaseBannedSignInError(message: string): boolean {
  return /\b(banned|disabled)\b/i.test(message);
}

/** GoTrue admin filter lookup — one request instead of paginating all users. */
async function fetchAuthUserByEmailFilter(email: string): Promise<User | null> {
  const supabaseUrl = getRuntimeConfig("SUPABASE_URL");
  const serviceRoleKey = getRuntimeSecret("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return null;

  const url = new URL(`${supabaseUrl}/auth/v1/admin/users`);
  url.searchParams.set("filter", email);
  url.searchParams.set("per_page", "1");

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
    },
  });
  if (!res.ok) return null;

  const body = (await res.json()) as { users?: User[] };
  const users = body.users ?? [];
  return users.find((u) => u.email?.toLowerCase() === email) ?? users[0] ?? null;
}

async function findAuthUserByEmailViaNda(email: string): Promise<User | null> {
  const { data: ndaRow } = await supabaseAdmin
    .from("nda_signatures")
    .select("user_id")
    .ilike("email", email)
    .order("signed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!ndaRow?.user_id) return null;

  const { data, error } = await supabaseAdmin.auth.admin.getUserById(ndaRow.user_id);
  if (error) throw new Error(error.message);
  return data.user ?? null;
}

export async function findAuthUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  const fromFilter = await fetchAuthUserByEmailFilter(normalized);
  if (fromFilter) return fromFilter;

  return findAuthUserByEmailViaNda(normalized);
}

export async function resolveBannedSignInMessage(
  email: string,
  errorMessage: string,
): Promise<string> {
  const displayMsg = errorMessage === "User is banned" ? "User Needs Admin Approval" : errorMessage;
  if (!isSupabaseBannedSignInError(errorMessage)) {
    return displayMsg;
  }

  const user = await findAuthUserByEmail(email);
  if (!user) return displayMsg;

  const state = inferAccountAccessState({
    banned_until: (user as { banned_until?: string | null }).banned_until ?? null,
    last_sign_in_at: user.last_sign_in_at ?? null,
    app_metadata: (user.app_metadata ?? null) as Record<string, unknown> | null,
  });

  if (state === ACCOUNT_STATUS_ACTIVE) return displayMsg;
  return signInBlockMessageForState(state);
}
