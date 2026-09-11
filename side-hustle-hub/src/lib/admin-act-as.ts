import { GYSH_ROLE_HOME, GYSH_ROLE_LABELS, userRoles, type GyshRole, type GyshUser } from "./gysh-roles";
import { getSessionStore } from "./browser-storage";

export const ADMIN_ACT_AS_KEY = "gysh_admin_act_as_v1";

/** Sent on member API calls when an admin is viewing another user's dashboard. */
export const ACT_AS_USER_HEADER = "x-gysh-act-as-user";

/** Audience the admin is previewing the member app as. */
export type ActAsAudience = "admin" | "guest" | "adult" | "kids" | "junior" | "senior";

export type ActAsUserTarget = {
  type: "user";
  id: string;
  name: string;
  email: string;
  roles: GyshRole[];
  membershipTier?: string | null;
  audience?: string | null;
};

export type ActAsTarget =
  | { type: "self" }
  | { type: "guest" }
  | { type: "audience"; audience: Exclude<ActAsAudience, "admin" | "guest"> }
  | ActAsUserTarget;

export const ACT_AS_GUEST_OPTION = {
  label: "Unlogged in User",
  description: "Guest experience — locked Blueprints, Login in the header",
} as const;

export const ACT_AS_AUDIENCE_OPTIONS: {
  audience: Exclude<ActAsAudience, "admin" | "guest">;
  label: string;
  description: string;
}[] = [
  { audience: "adult", label: "Adult Member", description: "Adult hub, Match Wizard, guides" },
  { audience: "kids", label: "Kids Member (4–12)", description: "Kids Side Hustle Corner" },
  { audience: "junior", label: "Teens Member (13–17)", description: "GYSH Teens Corner" },
  { audience: "senior", label: "Senior Member (50+)", description: "GYSH Seniors Corner" },
];

export function readActAsTarget(): ActAsTarget {
  try {
    const raw = getSessionStore().getItem(ADMIN_ACT_AS_KEY);
    if (!raw) return { type: "self" };
    const parsed = JSON.parse(raw) as ActAsTarget;
    if (parsed?.type === "self") return { type: "self" };
    if (parsed?.type === "guest") return { type: "guest" };
    if (parsed?.type === "audience" && parsed.audience) return parsed;
    if (parsed?.type === "user" && parsed.id && Array.isArray(parsed.roles)) {
      return {
        type: "user",
        id: String(parsed.id),
        name: String(parsed.name || "Member"),
        email: String(parsed.email || ""),
        roles: parsed.roles,
        membershipTier: parsed.membershipTier ?? null,
        audience: parsed.audience ?? null,
      };
    }
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
  if (target.type === "guest") return "guest";
  if (target.type === "audience") return target.audience;
  return audienceFromRoles(target.roles);
}

export function actAsLabel(target: ActAsTarget): string {
  if (target.type === "self") return "Admin (me)";
  if (target.type === "guest") return ACT_AS_GUEST_OPTION.label;
  if (target.type === "audience") {
    return ACT_AS_AUDIENCE_OPTIONS.find((o) => o.audience === target.audience)?.label ?? target.audience;
  }
  const roleText = target.roles.map((r) => GYSH_ROLE_LABELS[r] ?? r).join(" · ");
  return `${target.name}${roleText ? ` · ${roleText}` : ""}`;
}

export function actAsHomeView(target: ActAsTarget): string {
  const audience = actAsAudience(target);
  if (audience === "admin") return "admin";
  if (audience === "guest") return "dashboard";
  if (audience === "kids" || audience === "junior") return "kids";
  if (audience === "senior") return "seniors";
  return GYSH_ROLE_HOME.adult;
}

export function toActAsUserTarget(user: GyshUser): ActAsUserTarget {
  return {
    type: "user",
    id: user.id,
    name: user.name,
    email: user.email,
    roles: userRoles(user),
    membershipTier: user.membershipTier ?? null,
    audience: user.audience ?? null,
  };
}

/** Portal login accounts (password set) get a Dashboard link in Users Area. */
export function userHasAdminDashboardLink(user: Pick<GyshUser, "canLogin">): boolean {
  return Boolean(user.canLogin);
}

export function isActAsUserTarget(target: ActAsTarget): target is ActAsUserTarget {
  return target.type === "user";
}

export function actAsUserId(target: ActAsTarget): string | null {
  return target.type === "user" ? target.id : null;
}
