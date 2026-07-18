import { GYSH_ROLE_HOME, GYSH_ROLE_LABELS, userRoles, type GyshRole, type GyshUser } from "./gysh-roles";
import { getSessionStore } from "./browser-storage";

export const ADMIN_ACT_AS_KEY = "gysh_admin_act_as_v1";

/** Audience the admin is previewing the member app as. */
export type ActAsAudience = "admin" | "adult" | "kids" | "junior" | "senior";

export type ActAsTarget =
  | { type: "self" }
  | { type: "audience"; audience: Exclude<ActAsAudience, "admin"> }
  | {
      type: "user";
      id: string;
      name: string;
      email: string;
      roles: GyshRole[];
    };

export const ACT_AS_AUDIENCE_OPTIONS: {
  audience: Exclude<ActAsAudience, "admin">;
  label: string;
  description: string;
}[] = [
  { audience: "adult", label: "Adult Member", description: "Adult hub, Match Wizard, guides" },
  { audience: "kids", label: "Kids Member (4–12)", description: "Kids Side Hustle Corner" },
  { audience: "junior", label: "Teens Member (13–17)", description: "GYSH Teens Corner" },
  { audience: "senior", label: "Senior Member (55+)", description: "GYSH Seniors Corner" },
];

export function readActAsTarget(): ActAsTarget {
  try {
    const raw = getSessionStore().getItem(ADMIN_ACT_AS_KEY);
    if (!raw) return { type: "self" };
    const parsed = JSON.parse(raw) as ActAsTarget;
    if (parsed?.type === "self") return { type: "self" };
    if (parsed?.type === "audience" && parsed.audience) return parsed;
    if (parsed?.type === "user" && parsed.id && parsed.name) return parsed;
    return { type: "self" };
  } catch {
    return { type: "self" };
  }
}

export function writeActAsTarget(target: ActAsTarget): void {
  if (target.type === "self") {
    getSessionStore().removeItem(ADMIN_ACT_AS_KEY);
    return;
  }
  getSessionStore().setItem(ADMIN_ACT_AS_KEY, JSON.stringify(target));
}

export function clearActAsTarget(): void {
  getSessionStore().removeItem(ADMIN_ACT_AS_KEY);
}

/** Map a stored user to the primary member audience for navigation. */
export function audienceFromRoles(roles: GyshRole[]): ActAsAudience {
  if (roles.includes("kid")) return "kids";
  if (roles.includes("junior")) return "junior";
  if (roles.includes("senior")) return "senior";
  if (roles.includes("adult")) return "adult";
  if (roles.includes("admin") || roles.includes("qa")) return "admin";
  return "adult";
}

export function actAsAudience(target: ActAsTarget): ActAsAudience {
  if (target.type === "self") return "admin";
  if (target.type === "audience") return target.audience;
  return audienceFromRoles(target.roles);
}

export function actAsLabel(target: ActAsTarget): string {
  if (target.type === "self") return "Admin (me)";
  if (target.type === "audience") {
    return ACT_AS_AUDIENCE_OPTIONS.find((o) => o.audience === target.audience)?.label ?? target.audience;
  }
  const roleText = target.roles.map((r) => GYSH_ROLE_LABELS[r] ?? r).join(" · ");
  return `${target.name}${roleText ? ` · ${roleText}` : ""}`;
}

export function actAsHomeView(target: ActAsTarget): string {
  const audience = actAsAudience(target);
  if (audience === "admin") return "admin";
  if (audience === "kids" || audience === "junior") return "kids";
  if (audience === "senior") return "seniors";
  return GYSH_ROLE_HOME.adult;
}

export function toActAsUserTarget(user: GyshUser): ActAsTarget {
  return {
    type: "user",
    id: user.id,
    name: user.name,
    email: user.email,
    roles: userRoles(user),
  };
}
