/** Member progress API — checklist ticks, guide steps, team flags (D1). */
import { api } from "./api";

export type ProgressKind =
  | "launch_checklist"
  | "launch_guide_steps"
  | "kids_team"
  | "junior_team"
  | "senior_team"
  | "hustle_schedule";

export async function fetchMemberProgress<T = Record<string, unknown>>(
  kind: ProgressKind,
): Promise<T> {
  const data = await api<{ kind: string; payload: T }>(`member-progress/${kind}`);
  return (data.payload ?? {}) as T;
}

export async function saveMemberProgress<T = Record<string, unknown>>(
  kind: ProgressKind,
  payload: T,
): Promise<T> {
  const data = await api<{ kind: string; payload: T }>("member-progress", {
    method: "PUT",
    body: { kind, payload },
  });
  return (data.payload ?? payload) as T;
}
