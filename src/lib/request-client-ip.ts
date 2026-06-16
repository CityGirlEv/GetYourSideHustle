/** Best-effort client IP from reverse-proxy / Cloudflare headers. */
export function getClientIpFromRequest(request: Request): string | null {
  const h = request.headers;
  const candidates = [
    h.get("cf-connecting-ip"),
    h.get("x-real-ip"),
    (h.get("x-forwarded-for") || "").split(",")[0]?.trim(),
  ];
  for (const c of candidates) {
    if (c && c.length > 0) return c.slice(0, 128);
  }
  return null;
}

export function getUserAgentFromRequest(request: Request): string | null {
  return request.headers.get("user-agent")?.slice(0, 1024) ?? null;
}
