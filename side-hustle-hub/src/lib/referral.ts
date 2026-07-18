/** Local referral helpers for the member dashboard (until server-issued codes ship). */

const STORAGE_KEY = "gysh_referral_code";

function randomCode(len = 8): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export function getOrCreateReferralCode(): string {
  if (typeof window === "undefined") return "GYSHHOME";
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY)?.trim();
    if (existing) return existing.toUpperCase();
    const next = `GYSH${randomCode(6)}`;
    window.localStorage.setItem(STORAGE_KEY, next);
    return next;
  } catch {
    return "GYSHHOME";
  }
}

export function buildReferralUrl(code?: string): string {
  const ref = (code || getOrCreateReferralCode()).trim();
  if (typeof window === "undefined") {
    return `https://getyoursidehustle.com/?ref=${encodeURIComponent(ref)}`;
  }
  const origin = window.location.origin.replace(/\/$/, "");
  return `${origin}/?ref=${encodeURIComponent(ref)}`;
}
