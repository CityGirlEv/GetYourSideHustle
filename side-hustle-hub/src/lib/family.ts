/** Parent Coach — family children linked to the logged-in parent. */

import { api } from "./api";
import type { ProgressReportCadence } from "./family-logic";

export type FamilyChild = {
  id: string;
  displayName: string;
  ageBand: "kids" | "junior";
  status: string;
  source: "profile" | "signup";
  hasLogin?: boolean;
  /** Kid joined via Kids Corner but has no child_profiles row yet. */
  needsRegistration?: boolean;
  /** Email the kid entered on Join (or stored contact email on a profile). */
  childEmail?: string | null;
  juniorSignupId?: string | null;
};

export type FamilySettings = {
  progressReportCadence: ProgressReportCadence;
};

export async function fetchFamilyChildren(): Promise<FamilyChild[]> {
  const data = await api<{ children: FamilyChild[] }>("family/children");
  return Array.isArray(data.children) ? data.children : [];
}

export async function registerFamilyChild(input: {
  displayName: string;
  ageBand: "kids" | "junior";
  loginEmail?: string;
  loginPassword?: string;
  /** When registering a kid who already joined with the parent's email. */
  juniorSignupId?: string;
}): Promise<FamilyChild> {
  const data = await api<{ ok: boolean; child: FamilyChild }>("family/children", {
    method: "POST",
    body: input,
  });
  return data.child;
}

export async function fetchFamilySettings(): Promise<FamilySettings> {
  const data = await api<{ settings: FamilySettings }>("family/settings");
  return data.settings ?? { progressReportCadence: "none" };
}

export async function updateFamilySettings(input: {
  progressReportCadence: ProgressReportCadence;
}): Promise<FamilySettings> {
  const data = await api<{ settings: FamilySettings }>("family/settings", {
    method: "PUT",
    body: input,
  });
  return data.settings ?? { progressReportCadence: "none" };
}

export async function assignBlueprint(input: {
  blueprintId: string;
  /** null / "self" = keep on parent; child id = assign to that kid */
  childProfileId: string | null;
}): Promise<{ ok: boolean; blueprintId: string; childProfileId: string | null }> {
  return api("blueprints/assign", { method: "POST", body: input });
}
