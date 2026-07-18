import { canonicalUrl } from "@/lib/site-url";

export const RESET_PASSWORD_PATH = "/reset-password";

/** Canonical post-recovery landing URL (must be allowlisted in Supabase Auth). */
export function passwordRecoveryRedirectUrl(): string {
  return canonicalUrl(RESET_PASSWORD_PATH);
}

/** Forgot-password entry point on the sign-in tab (request a reset email). */
export function forgotPasswordEntryUrl(): string {
  return canonicalUrl("/auth?tab=sign-in");
}

type UrlParts = {
  hash?: string;
  search?: string;
};

function recoverySignals(parts: UrlParts): boolean {
  const hash = parts.hash ?? "";
  const search = parts.search ?? "";
  return (
    hash.includes("type=recovery") ||
    search.includes("type=recovery") ||
    hash.includes("access_token=") ||
    (search.includes("code=") && search.includes("type=recovery"))
  );
}

/** True when the current URL (or provided parts) carries Supabase password-recovery tokens. */
export function hasRecoveryTokensInUrl(parts?: UrlParts): boolean {
  if (parts) return recoverySignals(parts);
  if (typeof window === "undefined") return false;
  return recoverySignals({
    hash: window.location.hash,
    search: window.location.search,
  });
}

/**
 * Rewrite Supabase verify links so recovery always redirects to /reset-password
 * instead of the project Site URL (often /auth).
 */
export function rewriteRecoveryConfirmationUrl(
  url: string,
  redirectTarget = passwordRecoveryRedirectUrl(),
): string {
  try {
    const parsed = new URL(url);
    const type = parsed.searchParams.get("type");
    if (type === "recovery") {
      parsed.searchParams.set("redirect_to", redirectTarget);
      return parsed.toString();
    }
  } catch {
    /* keep original url */
  }
  return url;
}

/** Use a branded verify URL in emails; `/auth/verify` forwards to Supabase. */
export function brandRecoveryConfirmationUrl(
  supabaseVerifyUrl: string,
  redirectTarget = passwordRecoveryRedirectUrl(),
): string {
  const rewritten = rewriteRecoveryConfirmationUrl(supabaseVerifyUrl, redirectTarget);
  try {
    const parsed = new URL(rewritten);
    if (parsed.searchParams.get("type") !== "recovery") return rewritten;
    const branded = new URL(canonicalUrl("/auth/verify"));
    parsed.searchParams.forEach((value, key) => {
      branded.searchParams.set(key, value);
    });
    return branded.toString();
  } catch {
    return rewritten;
  }
}

/** Build Supabase `/auth/v1/verify` URL from current page query (used by /auth/verify). */
export function supabaseAuthVerifyUrl(
  searchParams: URLSearchParams,
  supabaseProjectUrl: string,
): string {
  const base = supabaseProjectUrl.replace(/\/$/, "");
  const target = new URL(`${base}/auth/v1/verify`);
  searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });
  return target.toString();
}

/** Full-page redirect that preserves hash/query tokens for Supabase session exchange. */
export function redirectToResetPasswordWithTokens(): void {
  if (typeof window === "undefined") return;
  const target = `${RESET_PASSWORD_PATH}${window.location.search}${window.location.hash}`;
  window.location.replace(target);
}
