/**
 * Scroll a focused Admin Studio row into view after filters/layout settle.
 * Retries because tab switches + filter state often paint one frame late.
 */
export function scrollAdminFocusIntoView(
  elementId: string,
  opts: { attempts?: number; delayMs?: number } = {},
): void {
  if (typeof document === "undefined") return;
  const attempts = opts.attempts ?? 8;
  const delayMs = opts.delayMs ?? 50;
  let left = attempts;

  const tryScroll = () => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    left -= 1;
    if (left <= 0) return;
    window.setTimeout(tryScroll, delayMs);
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(tryScroll);
  });
}
