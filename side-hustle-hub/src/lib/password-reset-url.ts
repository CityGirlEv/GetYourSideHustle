/** Read the password-reset token from `?reset=...`. */
export function readResetTokenFromUrl(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("reset");
    return token && token.trim() ? token.trim() : null;
  } catch {
    return null;
  }
}

/** Remove the reset param from the URL without reloading. */
export function clearResetTokenFromUrl(): void {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete("reset");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  } catch {
    /* ignore */
  }
}
