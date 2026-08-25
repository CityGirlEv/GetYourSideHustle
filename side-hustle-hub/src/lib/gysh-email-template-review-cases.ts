/**
 * One Testing Portal review case per Admin → Email Templates catalog entry.
 * Assigned to Candace for content/tone review (subject, body, preview, optional test send).
 *
 * Keep slugs/names in sync with functions/_lib/email-template-content.ts EMAIL_TEMPLATE_CATALOG.
 */

import type { TestCase } from "./gysh-test-plan";
import { adminMarkdownLink, emailTemplateAdminPath } from "./admin-deep-links";
import { currentSprintIndex, dueDatePlusDays } from "./gysh-sprints";

/** Catalog mirror for GYSH email templates (Admin → Email templates). */
export const EMAIL_TEMPLATE_REVIEW_CATALOG = [
  {
    slug: "registration_confirmation",
    name: "Registration confirmation",
    description: "Sent when someone registers — pending admin activation.",
  },
  {
    slug: "welcome_free",
    name: "Welcome · Free",
    description: "Sent when an admin activates a Free member.",
  },
  {
    slug: "welcome_starter",
    name: "Welcome · Starter",
    description: "Activation welcome framed for Starter perks + upgrades.",
  },
  {
    slug: "welcome_pro",
    name: "Welcome · Pro",
    description: "Activation welcome framed for Pro perks + Elite upgrade.",
  },
  {
    slug: "welcome_elite",
    name: "Welcome · Elite",
    description: "Activation welcome for Elite members.",
  },
  {
    slug: "parent_consent",
    name: "Parent consent",
    description: "Kids/Teens team signup — parent must approve (and create login if needed).",
  },
  {
    slug: "parent_account_ready",
    name: "Parent account ready",
    description: "Sent when consent creates a new parent coach login.",
  },
  {
    slug: "kid_login_ready",
    name: "Kid login ready",
    description: "Sent to the kid when their login password is created.",
  },
  {
    slug: "kid_login_ready_parent",
    name: "Kid login ready · Parent",
    description: "Sent to the parent when a kid login is created.",
  },
  {
    slug: "kid_login_notify",
    name: "Kid login notify",
    description: "Alert parent every time a linked kid/teen signs in.",
  },
  {
    slug: "parent_kid_progress_daily",
    name: "Parent kid progress · Daily",
    description: "Optional daily kid progress digest for parent coaches.",
  },
  {
    slug: "parent_kid_progress_weekly",
    name: "Parent kid progress · Weekly",
    description: "Optional weekly kid progress digest for parent coaches.",
  },
  {
    slug: "schedule_suite_reminder",
    name: "Schedule Suite reminder",
    description:
      "Pro+ hustle schedule reminder (daily / weekly / bi-weekly / monthly) with plan table and Kid Credits.",
  },
  {
    slug: "contact_inbox",
    name: "Contact form → admin",
    description: "Internal alert when Contact Us is submitted.",
  },
  {
    slug: "admin_form_notify",
    name: "Admin form notify",
    description: "Alert to admins whenever a public form is completed.",
  },
  {
    slug: "password_reset",
    name: "Password reset link",
    description: "Forgot-password email with one-time reset link.",
  },
  {
    slug: "password_changed",
    name: "Password changed",
    description: "Security notice after password update.",
  },
  {
    slug: "daily_admin_digest",
    name: "Daily Admin/QA digest",
    description:
      "Personal sprint summary for each Admin/QA at ~12:01 America/Chicago — outstanding, recently updated, new, and reassigned-away items.",
  },
] as const;

export type EmailTemplateReviewSlug = (typeof EMAIL_TEMPLATE_REVIEW_CATALOG)[number]["slug"];

export function emailTemplateReviewCaseId(slug: string): string {
  return `EMAIL-TPL-${slug}`;
}

/** Live current sprint for email-template review cases (Sprint 3+ as calendar advances). */
export function emailTemplateReviewSprint(ref: Date = new Date()): number {
  return Math.max(1, currentSprintIndex(ref));
}

/**
 * Half the catalog due today, half tomorrow (stable order by catalog index).
 * First ceil(n/2) → today; remainder → tomorrow.
 */
export function emailTemplateReviewDueDate(caseId: string, ref: Date = new Date()): string {
  const ids = EMAIL_TEMPLATE_REVIEW_CATALOG.map((t) => emailTemplateReviewCaseId(t.slug));
  const idx = ids.indexOf(caseId);
  if (idx < 0) return dueDatePlusDays(0, ref);
  const firstHalf = Math.ceil(ids.length / 2);
  return dueDatePlusDays(idx < firstHalf ? 0 : 1, ref);
}

/** True for Candace's per-template email review cases. */
export function isEmailTemplateReviewCaseId(caseId: string): boolean {
  return String(caseId || "")
    .toUpperCase()
    .startsWith("EMAIL-TPL-");
}

/** Manual QA: one case per email template, owned by Candace. */
export const EMAIL_TEMPLATE_REVIEW_CASES: TestCase[] = EMAIL_TEMPLATE_REVIEW_CATALOG.map((tpl) => {
  const href = emailTemplateAdminPath(tpl.slug);
  const openLink = adminMarkdownLink(`Email Templates · ${tpl.name}`, {
    tab: "email",
    template: tpl.slug,
  });
  return {
    id: emailTemplateReviewCaseId(tpl.slug),
    area: "Email",
    title: `Review email template: ${tpl.name}`,
    priority: "P1" as const,
    roles: ["qa", "admin"] as TestCase["roles"],
    assignees: ["candace"] as TestCase["assignees"],
    suite: "manual" as const,
    steps: [
      `Open ${openLink}`,
      `Confirm “${tpl.name}” (${tpl.slug}) is selected in the template list`,
      `Confirm description matches intent: ${tpl.description}`,
      "Review subject, preheader, eyebrow, headline, subhead, body, CTA label/URL, and footer for brand voice, clarity, and typos",
      "Confirm live preview looks branded and readable on a phone-width window",
      "Optional: Send test to a mailbox you control and confirm inbox content matches the preview",
      "Note any copy or layout issues in the Testing Portal note, then set Pass / Conditional / Fail",
    ],
    expected:
      "Template copy is clear and on-brand; preview is usable; optional test send matches preview (or issues are noted)",
    path: href,
  };
});
