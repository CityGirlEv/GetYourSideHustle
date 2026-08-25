import { api } from "./api";
import { SOFT_LAUNCH_ROLLOUT } from "./gysh-soft-launch-rollout";

export const NEWSLETTER_CADENCE = "weekly" as const;
export const NEWSLETTER_CADENCE_LABEL = "Weekly Newsletter";
export const NEWSLETTER_SEND_DAY = "Friday";

export type MemberNewsletterIssue = {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  publishedAt: string;
  audience: string;
};

export type MemberNewsletterTeaser = Omit<MemberNewsletterIssue, "body">;

/** Drop Content Factory admin appendix (artifacts, image prompts). */
export function memberNewsletterBody(raw: string): string {
  const text = String(raw || "");
  const cut = text.search(/\n--- /);
  return (cut >= 0 ? text.slice(0, cut) : text).trim();
}

export function normalizeNewsletterTitle(title: string): string {
  return title
    .replace(/^\[S\d+\]\s*/i, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function stripSprintPrefix(title: string): string {
  return title.replace(/^\[S\d+\]\s*/i, "").trim();
}

export function softLaunchNewsletterIssues(): MemberNewsletterIssue[] {
  return SOFT_LAUNCH_ROLLOUT.filter((item) => item.channel === "newsletter").map((item) => ({
    id: item.id,
    title: item.title,
    excerpt: (item.copy ?? "").split("\n").find((line) => line.startsWith("Subject:"))?.replace(/^Subject:\s*/i, "") || item.title,
    body: (item.copy ?? "").trim(),
    publishedAt: item.day,
    audience: "all",
  }));
}

export function publishedDraftsToIssues(
  drafts: Array<{
    id: string;
    type?: string;
    status?: string;
    title: string;
    excerpt?: string;
    body?: string;
    createdAt?: string;
    audience?: string;
  }>,
): MemberNewsletterIssue[] {
  return drafts
    .filter((d) => d.type === "newsletter" && d.status === "published")
    .map((d) => ({
      id: d.id,
      title: stripSprintPrefix(d.title),
      excerpt: d.excerpt || "",
      body: memberNewsletterBody(d.body || ""),
      publishedAt: d.createdAt || "",
      audience: d.audience || "all",
    }));
}

/** Published drafts win; soft-launch issues fill gaps so the archive is never empty. */
export function mergeMemberNewsletterIssues(
  published: MemberNewsletterIssue[],
  fallback: MemberNewsletterIssue[] = softLaunchNewsletterIssues(),
): MemberNewsletterIssue[] {
  const seen = new Set(published.map((issue) => normalizeNewsletterTitle(issue.title)));
  const extras = fallback.filter((issue) => !seen.has(normalizeNewsletterTitle(issue.title)));
  return [...published, ...extras].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function teaserIssues(issues: MemberNewsletterIssue[]): MemberNewsletterTeaser[] {
  return issues.map(({ body: _body, ...teaser }) => teaser);
}

export async function fetchPublishedNewsletters(): Promise<MemberNewsletterIssue[]> {
  const data = await api<{ issues?: MemberNewsletterIssue[] }>("newsletters");
  return Array.isArray(data.issues) ? data.issues : [];
}
