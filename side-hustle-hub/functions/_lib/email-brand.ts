/**
 * Branded GYSH email shell + membership perk copy for transactional mail.
 */

export const ROOT_DOMAIN = "getyoursidehustle.com";
export const SITE_NAME = "Get Your Side Hustle";
export const SITE_URL = `https://${ROOT_DOMAIN}`;
export const LOGO_URL = `${SITE_URL}/brand/gysh-logo-rocket.png`;
export const ADMIN_EMAIL = `info@${ROOT_DOMAIN}`;
/** Official GYSH Facebook page. */
export const FACEBOOK_URL = "https://www.facebook.com/getyoursidehustle";
/** Verified Resend sending domain (apex on Get Your Side Hustle account). */
export const EMAIL_SENDER_DOMAIN = ROOT_DOMAIN;

export type TierId = "free" | "starter" | "pro" | "elite";
export type PerkAudience = "adult" | "kids" | "junior" | "senior";

const TIER_LABEL: Record<TierId, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  elite: "Elite",
};

const TIER_PRICE: Record<TierId, string> = {
  free: "$0",
  starter: "$19/mo",
  pro: "$49/mo",
  elite: "$99/mo",
};

/** Slim perk lists for email (mirrors membership.ts highlights). */
const PERKS: Record<TierId, Record<PerkAudience, string[]>> = {
  free: {
    adult: ["Open free launch guides", "Run the Adult Match Wizard anytime", "Preview your Side Hustle Blueprint"],
    kids: ["Kids Corner free tips + stories preview", "Piggy Bank goal preview", "Safe Match Wizard with a parent"],
    junior: ["Teens Match Wizard", "Free CEO / give-back guides", "My Bank basics"],
    senior: ["Senior lane preview", "Flexible Match Wizard pacing", "Interest-list updates"],
  },
  starter: {
    adult: ["Full member guides", "GYSH Community", "Monthly 30-min 1-on-1 with T / E"],
    kids: ["Kids Team member guides", "Training videos", "Kevina Glow Getter extras", "Piggy Bank challenges"],
    junior: ["Teens Team guides", "Training videos", "CEO starter checklists", "My Bank goals"],
    senior: ["Senior Side Hustle team", "Peer learning circle", "Monthly 30-min 1-on-1"],
  },
  pro: {
    adult: ["Hustle schedule suite", "Group training", "Monthly 60-min 1-on-1", "Family kid-credit pool"],
    kids: ["Craft hustle playbooks", "Make games with AI (parent nearby)", "Kids schedule & tracker", "Workshop discounts"],
    junior: ["AI game + content starters", "Teens schedule suite", "Workshop invites", "Earn · save · reinvest tools"],
    senior: ["Flexible hustle schedule", "Progress reports", "Monthly 60-min 1-on-1", "Workshop member seats"],
  },
  elite: {
    adult: ["Monthly 90-min 1-on-1", "ZIP timing scout", "Priority support", "Highest credit pool"],
    kids: ["Max kid credits", "Priority family support", "All Pro kids perks"],
    junior: ["Max teen credits", "Priority support", "All Pro teens perks"],
    senior: ["Monthly 90-min 1-on-1", "ZIP timing scout", "Priority senior support"],
  },
};

const UPGRADES: Record<TierId, TierId[]> = {
  free: ["starter", "pro", "elite"],
  starter: ["pro", "elite"],
  pro: ["elite"],
  elite: [],
};

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function normalizeAudience(raw: string | null | undefined): PerkAudience {
  const a = String(raw || "adult").toLowerCase();
  if (a === "kids" || a === "kid") return "kids";
  if (a === "junior" || a === "teen" || a === "teens") return "junior";
  if (a === "senior") return "senior";
  if (a === "parent") return "kids";
  return "adult";
}

export function normalizeTier(raw: string | null | undefined): TierId {
  const t = String(raw || "free").toLowerCase();
  if (t === "starter" || t === "basic") return "starter";
  if (t === "pro") return "pro";
  if (t === "elite") return "elite";
  return "free";
}

export type BrandedEmailParts = {
  preheader: string;
  eyebrow: string;
  headline: string;
  subhead: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
};

/** Popping branded GYSH email wrapper — logo header, CTA, site/Facebook footer on every send. */
export function wrapBrandedEmail(parts: BrandedEmailParts): { html: string; text: string } {
  // Solid-color table button — many clients strip CSS gradients, which made white CTA text invisible.
  const cta =
    parts.ctaLabel && parts.ctaUrl
      ? `<tr><td align="center" style="padding:16px 32px 28px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
            <tr>
              <td align="center" bgcolor="#9B2F28" style="background-color:#9B2F28;border-radius:10px;border:1px solid #7a241e;">
                <a href="${escapeHtml(parts.ctaUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background-color:#9B2F28;color:#ffffff !important;font-family:Helvetica,Arial,sans-serif;font-weight:800;font-size:16px;line-height:1.25;text-decoration:none;padding:14px 28px;border-radius:10px;letter-spacing:0.02em;mso-padding-alt:0;">
                  <!--[if mso]><i style="letter-spacing:28px;mso-font-width:-100%;mso-text-raise:21pt;">&nbsp;</i><![endif]-->
                  <span style="color:#ffffff !important;text-decoration:none;">${escapeHtml(parts.ctaLabel)} →</span>
                  <!--[if mso]><i style="letter-spacing:28px;mso-font-width:-100%;">&nbsp;</i><![endif]-->
                </a>
              </td>
            </tr>
          </table>
          <p style="margin:14px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.45;color:#8a7a68;">
            Button not showing? Open this link:<br/>
            <a href="${escapeHtml(parts.ctaUrl)}" style="color:#9B2F28;word-break:break-all;">${escapeHtml(parts.ctaUrl)}</a>
          </p>
        </td></tr>`
      : "";

  const year = new Date().getFullYear();
  const footerHtml = `
        <tr><td style="padding:0 32px 8px;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5;color:#8a7a68;">
          ${parts.footerNote ? `<p style="margin:0 0 12px;">${escapeHtml(parts.footerNote)}</p>` : ""}
        </td></tr>
        <tr><td style="padding:0 24px 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2d5bc;background:#faf6ee;border-radius:0 0 14px 14px;">
            <tr><td align="center" style="padding:20px 20px 8px;">
              <a href="${SITE_URL}" style="text-decoration:none;">
                <img src="${LOGO_URL}" width="120" alt="${escapeHtml(SITE_NAME)}" style="display:block;width:120px;max-width:50%;height:auto;margin:0 auto 10px;"/>
              </a>
              <p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:800;color:#2d2a26;">
                ${escapeHtml(SITE_NAME)}
              </p>
              <p style="margin:0 0 12px;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:#8a7a68;">
                Four wizards. One family adventure.
              </p>
              <p style="margin:0 0 6px;font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;">
                <a href="${SITE_URL}" style="color:#9B2F28;text-decoration:none;">${ROOT_DOMAIN}</a>
                &nbsp;·&nbsp;
                <a href="${FACEBOOK_URL}" style="color:#9B2F28;text-decoration:none;">Facebook</a>
              </p>
              <p style="margin:0 0 10px;font-family:Helvetica,Arial,sans-serif;font-size:12px;">
                <a href="mailto:${ADMIN_EMAIL}" style="color:#6b5344;text-decoration:underline;">${ADMIN_EMAIL}</a>
              </p>
              <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#b09a7e;">
                © ${year} ${escapeHtml(SITE_NAME)}. All rights reserved.
              </p>
            </td></tr>
          </table>
        </td></tr>`;

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/><title>${escapeHtml(parts.headline)}</title></head>
<body style="margin:0;padding:0;background:#f3efe6;font-family:Georgia,'Times New Roman',serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(parts.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3efe6;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fffdf8;border-radius:18px;overflow:hidden;border:1px solid #e2d5bc;box-shadow:0 12px 40px rgba(45,42,38,0.08);">
        <tr><td style="height:6px;background:linear-gradient(90deg,#9B2F28,#D7C697,#9B2F28);"></td></tr>
        <tr><td align="center" style="padding:26px 28px 10px;background:linear-gradient(180deg,#fff8e8 0%,#fffdf8 100%);">
          <a href="${SITE_URL}" style="text-decoration:none;">
            <img src="${LOGO_URL}" width="168" alt="${escapeHtml(SITE_NAME)}" style="display:block;width:168px;max-width:70%;height:auto;border:0;"/>
          </a>
          <p style="margin:12px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:800;color:#2d2a26;">
            ${escapeHtml(SITE_NAME)}
          </p>
          <p style="margin:10px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:#9B2F28;">
            ${escapeHtml(parts.eyebrow)}
          </p>
        </td></tr>
        <tr><td style="padding:8px 32px 0;">
          <h1 style="margin:0 0 10px;font-size:30px;line-height:1.2;color:#2d2a26;font-weight:800;">
            ${escapeHtml(parts.headline)}
          </h1>
          <p style="margin:0 0 18px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;color:#6b5344;font-weight:600;">
            ${escapeHtml(parts.subhead)}
          </p>
        </td></tr>
        <tr><td style="padding:0 32px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#3a342e;">
          ${parts.bodyHtml}
        </td></tr>
        ${cta}
        ${footerHtml}
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    SITE_NAME,
    parts.headline,
    parts.subhead,
    "",
    parts.bodyHtml.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    parts.ctaUrl ? `\n${parts.ctaLabel || "Open"}: ${parts.ctaUrl}` : "",
    "",
    parts.footerNote || "",
    `Website: ${SITE_URL}`,
    `Facebook: ${FACEBOOK_URL}`,
    `Email: ${ADMIN_EMAIL}`,
    `© ${year} ${SITE_NAME}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { html, text };
}

export function perkBulletsHtml(tier: TierId, audience: PerkAudience): string {
  const items = PERKS[tier][audience];
  return `<ul style="margin:0 0 16px;padding:0 0 0 18px;">${items
    .map(
      (p) =>
        `<li style="margin:0 0 8px;"><strong style="color:#2d2a26;">${escapeHtml(p)}</strong></li>`,
    )
    .join("")}</ul>`;
}

export function upgradesHtml(current: TierId): string {
  const next = UPGRADES[current];
  if (!next.length) {
    return `<p style="margin:0 0 12px;padding:12px 14px;background:#f7f0df;border-radius:12px;border:1px solid #e2d5bc;">
      You're on <strong>Elite</strong> — the deepest GYSH support tier. Keep crushing it.
    </p>`;
  }
  const cards = next
    .map((t) => {
      const perks = PERKS[t].adult.slice(0, 3);
      return `<td width="50%" valign="top" style="padding:6px;">
        <div style="border:1px solid #e2d5bc;border-radius:14px;padding:14px;background:#fff;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#9B2F28;">Upgrade</p>
          <p style="margin:0 0 6px;font-size:18px;font-weight:800;color:#2d2a26;">${TIER_LABEL[t]} · ${TIER_PRICE[t]}</p>
          <ul style="margin:0;padding:0 0 0 16px;font-size:13px;color:#5c4f42;">
            ${perks.map((p) => `<li style="margin:0 0 4px;">${escapeHtml(p)}</li>`).join("")}
          </ul>
        </div>
      </td>`;
    })
    .join("");
  return `<p style="margin:18px 0 8px;font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#947d64;">Level up your hustle</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cards}</tr></table>`;
}

export function membershipDeepLink(audience?: "kids" | "junior" | "adult" | "senior"): string {
  const params = new URLSearchParams({ next: "join", from: "welcome" });
  if (audience) params.set("audience", audience);
  return `${SITE_URL}/?${params.toString()}`;
}

export function tierLabel(tier: TierId): string {
  return TIER_LABEL[tier];
}
