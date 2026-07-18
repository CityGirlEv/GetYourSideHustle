import { compareStaffByFullName } from "@/lib/staff-name-sort";

export type AgentAssigneeOption = {
  id: string;
  full_name: string;
  email: string;
};

type AuthUserLike = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

type ProfileLike = {
  full_name?: string | null;
};

/**
 * Resolve every user_roles agent id to a dropdown row. Profile names are used even
 * when the auth user is missing from a paginated listUsers response.
 */
export function buildAgentAssigneeOptions(
  ids: readonly string[],
  profiles: ReadonlyMap<string, ProfileLike>,
  authById: ReadonlyMap<string, AuthUserLike>,
): AgentAssigneeOption[] {
  const agents = ids.map((id) => {
    const u = authById.get(id);
    const profile = profiles.get(id);
    const email = u?.email ?? "";
    const full_name =
      profile?.full_name?.trim() ||
      (u?.user_metadata?.full_name as string | undefined)?.trim() ||
      email ||
      "";
    return { id, full_name, email };
  });
  agents.sort(compareStaffByFullName);
  return agents;
}
