/** Parent Coach — family children linked to the logged-in parent. */

import { api } from "./api";

export type FamilyChild = {
  id: string;
  displayName: string;
  ageBand: "kids" | "junior";
  status: string;
  source: "profile" | "signup";
};

export async function fetchFamilyChildren(): Promise<FamilyChild[]> {
  const data = await api<{ children: FamilyChild[] }>("family/children");
  return Array.isArray(data.children) ? data.children : [];
}
