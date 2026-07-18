/** Junior / Kids team signup with parental consent — client API. */

import { api } from "./api";

export type SignupTeam = "kids" | "junior";

export type JuniorSignupInput = {
  team: SignupTeam;
  childName: string;
  childEmail: string;
  parentEmail: string;
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

/** Read the consent token from the current URL (?consent=...). */
export function readConsentTokenFromUrl(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("consent");
    return token && token.trim() ? token.trim() : null;
  } catch {
    return null;
  }
}

/** Remove the consent param from the URL without reloading. */
export function clearConsentTokenFromUrl(): void {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete("consent");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  } catch {
    /* ignore */
  }
}
