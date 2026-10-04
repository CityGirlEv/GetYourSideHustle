/** Live site. Verification emails never use localhost, even if signup started there. */
export const MEMBERSHIP_ACTIVATION_ORIGIN = "https://getyoursidehustle.com";

/** Absolute activation link for the membership verification email. */
export function membershipActivationUrl(token: string): string {
  return `${MEMBERSHIP_ACTIVATION_ORIGIN}/?verify=${encodeURIComponent(token.trim())}`;
}

/** Read the membership verification token from `?verify=...`. */
export function readVerifyTokenFromUrl(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("verify");
    return token && token.trim() ? token.trim() : null;
  } catch {
    return null;
  }
}

/** Remove the verify param from the URL without reloading. */
export function clearVerifyTokenFromUrl(): void {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete("verify");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  } catch {
    /* ignore */
  }
}
