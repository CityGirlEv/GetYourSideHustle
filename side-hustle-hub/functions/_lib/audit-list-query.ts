import { canonicalizeEmail } from "./crypto";

/** Parse GET /api/audit query string (email filter + row cap). */
export function parseAuditListQuery(requestUrl: string): { email: string; limit: number } {
  const url = new URL(requestUrl);
  const email = canonicalizeEmail(String(url.searchParams.get("email") || ""));
  const rawLimit = Number(url.searchParams.get("limit") || 500);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.floor(rawLimit), 1), 2000) : 500;
  return { email, limit };
}
