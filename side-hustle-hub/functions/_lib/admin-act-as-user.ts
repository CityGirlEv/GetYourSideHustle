import { canAccessAdminPortal } from "./roles";
import {
  error,
  getUserById,
  userRoles,
  type DbUser,
  type Env,
} from "./auth";

/** Must match src/lib/admin-act-as.ts ACT_AS_USER_HEADER. */
export const ACT_AS_USER_HEADER = "x-gysh-act-as-user";

/**
 * When an admin sends X-Gysh-Act-As-User, resolve that member for dashboard GETs.
 * Mutations are blocked while acting as another user (read-only view).
 */
export async function resolveMemberUserForRequest(
  env: Env,
  request: Request,
  sessionUser: DbUser,
): Promise<{ user: DbUser; actAsUserId: string | null } | Response> {
  const actAsId = (request.headers.get(ACT_AS_USER_HEADER) || "").trim();
  if (!actAsId || actAsId === sessionUser.id) {
    return { user: sessionUser, actAsUserId: null };
  }

  if (!canAccessAdminPortal(userRoles(sessionUser))) {
    return error("Only admins can view another member's dashboard.", 403);
  }

  const method = request.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    return error("Read-only while viewing another member's dashboard.", 403);
  }

  const target = await getUserById(env.DB, actAsId);
  if (!target || target.status === "deleted") {
    return error("Member not found.", 404);
  }

  return { user: target, actAsUserId: actAsId };
}

/** Member dashboard data routes that should honor act-as (not auth/me or admin APIs). */
export function isMemberDashboardActAsRoute(route: string, parts: string[]): boolean {
  if (
    route === "member-credits" ||
    route === "member-purchases" ||
    route === "member-progress" ||
    route === "newsletters" ||
    route === "family/children" ||
    route === "family/settings" ||
    route === "blueprints" ||
    route === "blueprints/assign" ||
    route === "blueprints/assign-match" ||
    route === "blueprints/claim" ||
    route === "blueprints/favorites"
  ) {
    return true;
  }
  if (parts[0] === "member-progress") return true;
  if (parts[0] === "blueprints" && parts[1] && parts[1] !== "pending") return true;
  return false;
}
