import type { Session, User } from "@supabase/supabase-js";

/** Unix seconds from JWT `iat`, or null if unavailable. */
export function jwtIssuedAt(accessToken: string): number | null {
  try {
    const payload = JSON.parse(atob(accessToken.split(".")[1] ?? ""));
    return typeof payload.iat === "number" ? payload.iat : null;
  } catch {
    return null;
  }
}

/** Admin forced logout stamps `app_metadata.force_logout_at` (ISO string). */
export function isForceLoggedOut(session: Session, authUser: User | null): boolean {
  const forceRaw = authUser?.app_metadata?.force_logout_at;
  if (typeof forceRaw !== "string" || !forceRaw) return false;
  const forceMs = Date.parse(forceRaw);
  if (!Number.isFinite(forceMs)) return false;

  const iat = jwtIssuedAt(session.access_token);
  if (iat != null) return iat * 1000 < forceMs;

  // Fallback when JWT can't be decoded.
  const expiresAt = session.expires_at ?? 0;
  if (expiresAt > 0) return (expiresAt - 3600) * 1000 < forceMs;
  return true;
}

/** Clear local auth storage after server-side revocation. */
export async function clearLocalAuthSession(
  signOut: (options?: { scope?: "local" | "global" }) => Promise<{ error: Error | null }>,
) {
  await signOut({ scope: "local" });
}
