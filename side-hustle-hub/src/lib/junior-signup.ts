/** Kids (4–12) team signup with parental consent; Teens (13+) join without consent. */

import { api } from "./api";

export type SignupTeam = "kids" | "junior";

export type JuniorSignupInput = {
  team: SignupTeam;
  childName: string;
  childEmail: string;
  /** Required for Kids (through age 12). Not used for Teens (13+). */
  parentEmail?: string;
};

export type ConsentSignup = {
  childName: string;
  team: SignupTeam;
  teamLabel: string;
  status: "pending_parent" | "active" | "declined";
  parentEmail: string;
  consentGrantedAt: string | null;
};

export type ParentConsentInput = {
  decision: "approve" | "decline";
  approved?: boolean;
  parentName?: string;
  parentPhone?: string;
  parentAddress?: string;
  parentRelationship?: string;
};

export async function submitJuniorSignup(
  input: JuniorSignupInput,
): Promise<{ ok: boolean; emailSent: boolean; message: string }> {
  return api("junior-signups", { method: "POST", auth: false, body: input });
}

export async function fetchConsent(token: string): Promise<{ signup: ConsentSignup }> {
  return api(`junior-signups/consent/${encodeURIComponent(token)}`, { auth: false });
}

export async function submitParentConsent(
  token: string,
  input: ParentConsentInput,
): Promise<{ ok: boolean; status: string; message: string }> {
  return api(`junior-signups/consent/${encodeURIComponent(token)}`, {
    method: "POST",
    auth: false,
    body: input,
  });
}

/** Normalize a consent token from a URL or pasted link (strip junk from email clients). */
export function normalizeConsentToken(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const hex = raw.trim().replace(/[^a-fA-F0-9]/g, "");
  return hex.length >= 32 ? hex : null;
}

/**
 * Read the consent token from the current URL.
 * Supports `?consent=…` and path `/consent/<token>` (preferred in emails — survives redirects).
 */
export function readConsentTokenFromUrl(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = normalizeConsentToken(params.get("consent"));
    if (fromQuery) return fromQuery;

    const path = window.location.pathname || "";
    const match = path.match(/^\/consent\/([a-fA-F0-9]+)\/?$/i);
    if (match) return normalizeConsentToken(match[1]);
    return null;
  } catch {
    return null;
  }
}

/** Remove the consent param / path from the URL without reloading. */
export function clearConsentTokenFromUrl(): void {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete("consent");
    if (/^\/consent\//i.test(url.pathname)) {
      url.pathname = "/";
    }
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  } catch {
    /* ignore */
  }
}
