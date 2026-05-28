export const DEFAULT_SIGN_IN_REDIRECT = "/advisor";

/**
 * Keep post-login redirects inside this app and fall back safely otherwise.
 */
export function safeSignInRedirect(value: unknown, fallback = DEFAULT_SIGN_IN_REDIRECT): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  return value;
}