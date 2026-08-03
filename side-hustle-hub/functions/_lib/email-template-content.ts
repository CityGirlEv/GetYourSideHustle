/**
 * Editable email template content (Admin → Email templates).
 * Defaults use {{placeholders}} for dynamic send-time values.
 */
import {
  ADMIN_EMAIL,
  membershipDeepLink,
  SITE_NAME,
  SITE_URL,
  wrapBrandedEmail,
  type BrandedEmailParts,
} from "./email-brand";

export type EmailTemplateContent = {
  subject: string;
  preheader: string;
  eyebrow: string;
  headline: string;
  subhead: string;
  bodyHtml: string;
  ctaLabel: string;
  ctaUrl: string;
  footerNote: string;
  /** When true, body is mostly generated live (digest) — subject/intro still editable. */
  dynamicBody?: boolean;
};

/** Catalog of template slugs for the admin Email Templates page. */
export const EMAIL_TEMPLATE_CATALOG: Array<{
  slug: string;
  name: string;
  description: string;
  sampleSubject: string;
}> = [
  {
    slug: "registration_confirmation",
    name: "Registration confirmation",
    description: "Sent when someone registers — pending admin activation.",
    sampleSubject: `${SITE_NAME} — we got your signup!`,
  },
  {
    slug: "welcome_free",
    name: "Welcome · Free",
    description: "Sent when an admin activates a Free member.",
    sampleSubject: `${SITE_NAME} — you're activated! Welcome aboard`,
  },
  {
    slug: "welcome_starter",
    name: "Welcome · Starter",
    description: "Activation welcome framed for Starter perks + upgrades.",
    sampleSubject: `${SITE_NAME} — you're activated! Welcome aboard`,
  },
  {
    slug: "welcome_pro",
    name: "Welcome · Pro",
    description: "Activation welcome framed for Pro perks + Elite upgrade.",
    sampleSubject: `${SITE_NAME} — you're activated! Welcome aboard`,
  },
  {
    slug: "welcome_elite",
    name: "Welcome · Elite",
    description: "Activation welcome for Elite members.",
    sampleSubject: `${SITE_NAME} — you're activated! Welcome aboard`,
  },
  {
    slug: "parent_consent",
    name: "Parent consent",
    description: "Kids/Teens team signup — parent must approve (and create login if needed).",
    sampleSubject: `${SITE_NAME} — approve a team request`,
  },
  {
    slug: "parent_account_ready",
    name: "Parent account ready",
    description: "Sent when consent creates a new parent coach login.",
    sampleSubject: `${SITE_NAME} — parent coach login ready`,
  },
  {
    slug: "kid_login_ready",
    name: "Kid login ready",
    description: "Sent to the kid when their login password is created.",
    sampleSubject: `${SITE_NAME} — you can log in!`,
  },
  {
    slug: "kid_login_ready_parent",
    name: "Kid login ready · Parent",
    description: "Sent to the parent when a kid login is created.",
    sampleSubject: `${SITE_NAME} — kid can log in`,
  },
  {
    slug: "kid_login_notify",
    name: "Kid login notify",
    description: "Alert parent every time a linked kid/teen signs in.",
    sampleSubject: `${SITE_NAME} — kid signed in`,
  },
  {
    slug: "parent_kid_progress_daily",
    name: "Parent kid progress · Daily",
    description: "Optional daily kid progress digest for parent coaches.",
    sampleSubject: `${SITE_NAME} — daily kid progress`,
  },
  {
    slug: "parent_kid_progress_weekly",
    name: "Parent kid progress · Weekly",
    description: "Optional weekly kid progress digest for parent coaches.",
    sampleSubject: `${SITE_NAME} — weekly kid progress`,
  },
  {
    slug: "contact_inbox",
    name: "Contact form → admin",
    description: "Internal alert when Contact Us is submitted.",
    sampleSubject: `[GYSH contact] …`,
  },
  {
    slug: "admin_form_notify",
    name: "Admin form notify",
    description: "Alert to admins whenever a public form is completed.",
    sampleSubject: `[GYSH …] …`,
  },
  {
    slug: "password_reset",
    name: "Password reset link",
    description: "Forgot-password email with one-time reset link.",
    sampleSubject: `${SITE_NAME} — reset your password`,
  },
  {
    slug: "password_changed",
    name: "Password changed",
    description: "Security notice after password update.",
    sampleSubject: `${SITE_NAME} — password updated`,
  },
  {
    slug: "daily_admin_digest",
    name: "Daily Admin/QA digest",
    description:
      "Personal sprint summary for each Admin/QA at ~12:01 America/Chicago — outstanding, recently updated, new, and reassigned-away items.",
    sampleSubject: `${SITE_NAME} — daily digest for Evelyn (…)`,
  },
];

export type EmailTemplateVars = Record<string, string>;

/** Sample vars for admin preview / test sends. */
export const PREVIEW_SAMPLE_VARS: EmailTemplateVars = {
  name: "Side Hustler",
  email: "sample@example.com",
  message: "This is a preview of a Contact Us message.",
  ctaUrl: `${SITE_URL}/?preview=1`,
  resetUrl: `${SITE_URL}/?reset=preview-token`,
  consentUrl: `${SITE_URL}/?consent=preview-token`,
  tier: "Free",
  perksHtml:
    "<ul style=\"margin:0;padding-left:18px;\"><li>Open free launch guides</li><li>Run the Adult Match Wizard anytime</li><li>Preview your Side Hustle Blueprint</li></ul>",
  upgradesHtml: "",
  certHtml: "",
  childName: "Alex",
  audienceLabel: "Kids",
  periodKey: "2026-08-02",
  cadence: "Daily",
  digestBodyHtml:
    "<p style=\"margin:0;\">Preview of your personal Admin/QA digest body (live digests are generated per person).</p>",
};

export function applyTemplateVars(input: string, vars: EmailTemplateVars): string {
  return String(input || "").replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    if (Object.prototype.hasOwnProperty.call(vars, key)) return vars[key] ?? "";
    return "";
  });
}

export function applyContentVars(
  content: EmailTemplateContent,
  vars: EmailTemplateVars,
): EmailTemplateContent {
  return {
    ...content,
    subject: applyTemplateVars(content.subject, vars),
    preheader: applyTemplateVars(content.preheader, vars),
    eyebrow: applyTemplateVars(content.eyebrow, vars),
    headline: applyTemplateVars(content.headline, vars),
    subhead: applyTemplateVars(content.subhead, vars),
    bodyHtml: applyTemplateVars(content.bodyHtml, vars),
    ctaLabel: applyTemplateVars(content.ctaLabel, vars),
    ctaUrl: applyTemplateVars(content.ctaUrl, vars),
    footerNote: applyTemplateVars(content.footerNote, vars),
  };
}

export function renderContent(
  content: EmailTemplateContent,
  vars: EmailTemplateVars = {},
): { subject: string; html: string; text: string } {
  const filled = applyContentVars(content, { ...PREVIEW_SAMPLE_VARS, ...vars });
  const parts: BrandedEmailParts = {
    preheader: filled.preheader,
    eyebrow: filled.eyebrow,
    headline: filled.headline,
    subhead: filled.subhead,
    bodyHtml: filled.bodyHtml,
    ctaLabel: filled.ctaLabel || undefined,
    ctaUrl: filled.ctaUrl || undefined,
    footerNote: filled.footerNote || undefined,
  };
  const branded = wrapBrandedEmail(parts);
  return { subject: filled.subject, html: branded.html, text: branded.text };
}

function welcomeDefault(tierLabelText: string): EmailTemplateContent {
  const joinUrl = membershipDeepLink();
  return {
    subject: `${SITE_NAME} — you're activated! Welcome aboard`,
    preheader: `You're activated on ${tierLabelText} — see your perks!`,
    eyebrow: "You're in · Account activated",
    headline: "Welcome to the hustle family!",
    subhead: `Your account is LIVE on the {{tier}} plan.`,
    bodyHtml: `<p style="margin:0 0 14px;">This is your official green light. Log in and use every perk that comes with <strong>{{tier}}</strong>.</p>
        <p style="margin:0 0 8px;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#947d64;">Your {{tier}} perks</p>
        {{perksHtml}}{{certHtml}}{{upgradesHtml}}`,
    ctaLabel: "See membership & upgrade",
    ctaUrl: joinUrl,
    footerNote: "Sign in anytime at getyoursidehustle.com.",
  };
}

/** Code defaults for every catalog slug (seeded into D1 for editing). */
export function defaultContentForSlug(slug: string): EmailTemplateContent | null {
  switch (slug) {
    case "registration_confirmation":
      return {
        subject: `${SITE_NAME} — we got your signup!`,
        preheader: "Welcome to the GYSH family — your membership details inside!",
        eyebrow: "Membership · Pending activation",
        headline: "{{name}}, welcome to the GYSH family!",
        subhead: "You're on the {{tier}} plan. An admin will activate your login soon.",
        bodyHtml: `<p style="margin:0 0 12px;">We've saved your membership request. Here's what you unlocked on <strong>{{tier}}</strong>:</p>
        {{perksHtml}}{{certHtml}}{{upgradesHtml}}
        <p style="margin:16px 0 0;padding:12px 14px;background:#fff4e8;border-radius:12px;border-left:4px solid #9B2F28;">
          <strong>Next:</strong> A GYSH admin activates your account. You'll get a second email the moment you can sign in.
        </p>`,
        ctaLabel: "Explore membership upgrades",
        ctaUrl: membershipDeepLink(),
        footerNote: "Pending accounts can't sign in until an admin activates them.",
      };
    case "welcome_free":
      return welcomeDefault("Free");
    case "welcome_starter":
      return welcomeDefault("Starter");
    case "welcome_pro":
      return welcomeDefault("Pro");
    case "welcome_elite":
      return welcomeDefault("Elite");
    case "parent_consent":
      return {
        subject: `${SITE_NAME} — approve {{childName}}'s team request`,
        preheader: "Approve {{childName}}'s GYSH team request",
        eyebrow: "Kids Corner · Parent consent",
        headline: "A young Side Hustler needs your yes!",
        subhead: "{{childName}} asked to join the GYSH team — with you as GYSH Coach.",
        bodyHtml: `<p style="margin:0 0 12px;">You're the coach. Cheer, set boundaries, and help turn ideas into safe first wins.</p>
        <p style="margin:0 0 12px;">Parental consent is required through age 12. Tap below to grant permission. If you do not already have a GYSH login, you will create a username and password on that page so the kid profile links to you.</p>
        <p style="margin:0;">Until you approve, the account stays pending.</p>`,
        ctaLabel: "Approve as parent / guardian",
        ctaUrl: "{{consentUrl}}",
        footerNote: "If you didn't expect this, you can ignore this email.",
      };
    case "parent_account_ready":
      return {
        subject: `${SITE_NAME} — parent coach login ready`,
        preheader: "Your GYSH parent coach login is ready",
        eyebrow: "Family · Parent coach",
        headline: "Your parent coach login is ready",
        subhead: "Hi {{name}}, you can sign in and manage linked kids from your Dashboard.",
        bodyHtml: `<p style="margin:0;">Use the email and password you set during consent approval.</p>`,
        ctaLabel: "Open my Dashboard",
        ctaUrl: SITE_URL,
        footerNote: "",
      };
    case "kid_login_ready":
      return {
        subject: `${SITE_NAME} — you can log in!`,
        preheader: "Your GYSH kid login is ready",
        eyebrow: "Kids Corner",
        headline: "You're cleared to log in!",
        subhead: "Hi {{name}}, your Get Your Side Hustle login is ready.",
        bodyHtml: `<p style="margin:0;">Use the email and password your parent set up for you.</p>`,
        ctaLabel: "Log in to GYSH",
        ctaUrl: SITE_URL,
        footerNote: "",
      };
    case "kid_login_ready_parent":
      return {
        subject: `${SITE_NAME} — kid can log in`,
        preheader: "A linked kid login is ready",
        eyebrow: "Family · Parent coach",
        headline: "{{childName}} can log in",
        subhead: "Hi {{name}}, a kid login is ready on your family account.",
        bodyHtml: `<p style="margin:0;">They can sign in with the kid email and password you created.</p>`,
        ctaLabel: "Open Family Dashboard",
        ctaUrl: SITE_URL,
        footerNote: "",
      };
    case "kid_login_notify":
      return {
        subject: `${SITE_NAME} — kid signed in`,
        preheader: "{{childName}} just signed in to GYSH",
        eyebrow: "Family · Login alert",
        headline: "{{childName}} signed in",
        subhead: "Hi {{name}}, a linked kid/teen just signed in.",
        bodyHtml: `<p style="margin:0;">Open your Dashboard anytime to review progress and Blueprints.</p>`,
        ctaLabel: "Open my Dashboard",
        ctaUrl: SITE_URL,
        footerNote: "",
      };
    case "parent_kid_progress_daily":
    case "parent_kid_progress_weekly": {
      const cadence = slug.endsWith("weekly") ? "Weekly" : "Daily";
      return {
        subject: `${SITE_NAME} — ${cadence.toLowerCase()} kid progress`,
        preheader: `${cadence} kid progress for your family`,
        eyebrow: `Family · ${cadence} progress`,
        headline: `${cadence} kid progress`,
        subhead: "Hi {{name}}, here's a quick look at linked kids for {{periodKey}}.",
        bodyHtml: `{{digestBodyHtml}}`,
        ctaLabel: "Open my Dashboard",
        ctaUrl: SITE_URL,
        footerNote: "Change daily/weekly reports anytime under Dashboard → Family.",
        dynamicBody: true,
      };
    }
    case "contact_inbox":
      return {
        subject: `[GYSH contact] {{name}}`,
        preheader: "New contact from {{name}}",
        eyebrow: "Inbox · Contact Us",
        headline: "New message just landed!",
        subhead: "{{name}} wrote in from the GYSH Contact form.",
        bodyHtml: `<p style="margin:0 0 8px;"><strong>From:</strong> {{name}} &lt;<a href="mailto:{{email}}" style="color:#9B2F28;">{{email}}</a>&gt;</p>
        <div style="margin:16px 0;padding:16px;border-radius:12px;background:#f7f0df;border:1px solid #e2d5bc;">{{message}}</div>`,
        ctaLabel: "Reply to sender",
        ctaUrl: "mailto:{{email}}",
        footerNote: "",
      };
    case "admin_form_notify":
      return {
        subject: `[GYSH {{name}}]`,
        preheader: "GYSH form: {{name}}",
        eyebrow: "Admin inbox · Form alert",
        headline: "New {{name}}",
        subhead: "A public GYSH form was completed.",
        bodyHtml: `<p style="margin:0 0 12px;">Someone just finished <strong>{{name}}</strong> on Get Your Side Hustle.</p>
        <p style="margin:0 0 8px;font-size:13px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#947d64;">Submission details</p>
        <div style="margin:0 0 12px;padding:16px;border-radius:12px;background:#f7f0df;border:1px solid #e2d5bc;">{{message}}</div>
        <p style="margin:0;">Open Admin to follow up, or reply if a sender email is included.</p>`,
        ctaLabel: "Open GYSH Admin",
        ctaUrl: "{{ctaUrl}}",
        footerNote: "This alert was sent because a GYSH public form was completed.",
      };
    case "password_reset":
      return {
        subject: `${SITE_NAME} — reset your password`,
        preheader: "Reset your Get Your Side Hustle password.",
        eyebrow: "Account security",
        headline: "Reset your password",
        subhead:
          "Hi {{name}}, we received a request to reset a GYSH password for this email.",
        bodyHtml: `<p style="margin:0 0 12px;">If an account exists for this email address, tap the button below to choose a new password. This link expires in <strong>1 hour</strong> and can only be used once.</p>
        <p style="margin:0 0 12px;">If you didn’t ask for this, you can ignore this email — your password stays the same.</p>`,
        ctaLabel: "Reset my password",
        ctaUrl: "{{resetUrl}}",
        footerNote: "Never share this link. GYSH will never ask for your password by email.",
      };
    case "password_changed":
      return {
        subject: `${SITE_NAME} — password updated`,
        preheader: "Your GYSH password was just updated.",
        eyebrow: "Account security",
        headline: "Password updated — you're locked in.",
        subhead: "Hi {{name}}, your Get Your Side Hustle password changed successfully.",
        bodyHtml: `<p style="margin:0 0 12px;">If <strong>you</strong> made this change, you're all set — keep building that Side Hustle momentum.</p>
        <p style="margin:0 0 12px;">If you <em>didn't</em> change it, contact us immediately at <a href="mailto:${ADMIN_EMAIL}" style="color:#9B2F28;">${ADMIN_EMAIL}</a>.</p>`,
        ctaLabel: "Open GYSH",
        ctaUrl: SITE_URL,
        footerNote: "Security tip: use a unique password you don't reuse elsewhere.",
      };
    case "daily_admin_digest":
      return {
        subject: `${SITE_NAME} — daily digest for {{name}} ({{periodKey}})`,
        preheader: "Your GYSH Admin/QA daily digest",
        eyebrow: "Daily digest · Admin & QA",
        headline: "{{name}}, your Side Hustle board called.",
        subhead: "A warm, honest snapshot of your tasks and tests — by sprint.",
        bodyHtml: `{{digestBodyHtml}}`,
        ctaLabel: "Open Admin · Schedule & Plan",
        ctaUrl: `${SITE_URL}/?next=admin&tab=schedule`,
        footerNote: "Digests send around 12:01 America/Chicago. You're getting this because you have Admin or QA access.",
        dynamicBody: true,
      };
    default:
      return null;
  }
}
