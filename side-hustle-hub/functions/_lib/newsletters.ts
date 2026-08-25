import type { DbUser, Env } from "./auth";
import { userRoles } from "./auth";
import { json } from "./crypto";
import { canAccessAdminPortal } from "./roles";

export function memberNewsletterBody(raw: string): string {
  const text = String(raw || "");
  const cut = text.search(/\n--- /);
  return (cut >= 0 ? text.slice(0, cut) : text).trim();
}

export function stripSprintPrefix(title: string): string {
  return String(title || "").replace(/^\[S\d+\]\s*/i, "").trim();
}

export function canReadNewsletter(user: Pick<DbUser, "role" | "roles" | "membership_tier">): boolean {
  if (canAccessAdminPortal(userRoles(user))) return true;
  const tier = String(user.membership_tier || "free").toLowerCase();
  return tier === "starter" || tier === "pro" || tier === "elite";
}

export async function listMemberNewsletters(env: Env, user: DbUser): Promise<Response> {
  const drafts = await env.DB.prepare(
    `SELECT id, title, excerpt, body, audience, created_at
     FROM content_drafts
     WHERE type = 'newsletter' AND status = 'published'
     ORDER BY created_at DESC`,
  ).all<{
    id: string;
    title: string;
    excerpt: string;
    body: string;
    audience: string;
    created_at: string;
  }>();

  const open = canReadNewsletter(user);
  const issues = (drafts.results ?? []).map((d) => ({
    id: d.id,
    title: stripSprintPrefix(d.title),
    excerpt: d.excerpt || "",
    body: open ? memberNewsletterBody(d.body || "") : "",
    publishedAt: d.created_at,
    audience: d.audience || "all",
  }));

  return json({
    access: open ? "open" : "locked",
    cadence: "weekly",
    issues,
  });
}
