/** Best-effort client IP from Cloudflare / proxy headers. */
export function getClientIpFromRequest(request: Request): string | null {
  const h = request.headers;
  const candidates = [
    h.get("cf-connecting-ip"),
    h.get("x-real-ip"),
    (h.get("x-forwarded-for") || "").split(",")[0]?.trim(),
  ];
  for (const c of candidates) {
    if (c && c.length > 0) return c;
  }
  return null;
}
