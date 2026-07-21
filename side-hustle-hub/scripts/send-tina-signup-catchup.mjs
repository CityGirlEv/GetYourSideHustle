/**
 * Send Tina the admin “New member signup” alert (+ registration confirmation sample)
 * and log both to email_log. Uses .dev.vars RESEND_API_KEY.
 *
 * Usage: node --use-system-ca scripts/send-tina-signup-catchup.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const wranglerJs = path.resolve(
  root,
  "../../muntie-ev-ai-studio-main/node_modules/wrangler/bin/wrangler.js",
);

const TINA = "tinamariebarham@gmail.com";
const SITE = "https://getyoursidehustle.com";

function loadDevVars() {
  const p = path.join(root, ".dev.vars");
  if (!fs.existsSync(p)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(p, "utf8")
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith("#") && l.includes("="))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      }),
  );
}

function d1(sql) {
  execFileSync(
    process.execPath,
    [
      "--use-system-ca",
      wranglerJs,
      "d1",
      "execute",
      "gysh-db",
      "--remote",
      "--command",
      sql,
    ],
    { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
}

function sqlStr(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

async function sendAndLog({ to, subject, html, text, templateSlug, meta }) {
  const vars = loadDevVars();
  const key = (vars.RESEND_API_KEY || "").trim();
  const from = (vars.EMAIL_FROM || "Get Your Side Hustle <noreply@getyoursidehustle.com>").trim();
  if (!key.startsWith("re_")) throw new Error("Missing RESEND_API_KEY in .dev.vars");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
  });
  const bodyText = await res.text();
  console.log(templateSlug, "→", to, "HTTP", res.status);
  if (!res.ok) throw new Error(bodyText);

  let providerId = null;
  try {
    providerId = JSON.parse(bodyText)?.id || null;
  } catch {
    /* ignore */
  }

  const now = new Date().toISOString();
  d1(`INSERT INTO email_log (id, template_slug, to_email, user_id, subject, status, provider_id, error, meta_json, created_at)
      VALUES (${sqlStr(randomUUID())}, ${sqlStr(templateSlug)}, ${sqlStr(to)}, 'u-tina', ${sqlStr(subject)},
              'sent', ${providerId ? sqlStr(providerId) : "NULL"}, '', ${sqlStr(JSON.stringify(meta))}, ${sqlStr(now)})`);
  console.log("  logged", templateSlug);
}

const adminHtml = `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#f3efe6;font-family:Helvetica,Arial,sans-serif;color:#2d2a26;">
<table width="100%"><tr><td align="center">
<table width="600" style="max-width:600px;background:#fffdf8;border:1px solid #e2d5bc;border-radius:16px;">
<tr><td style="height:6px;background:linear-gradient(90deg,#9B2F28,#D7C697,#9B2F28);"></td></tr>
<tr><td style="padding:28px 32px;">
<p style="margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#9B2F28;">Admin inbox · Form alert</p>
<h1 style="margin:0 0 10px;font-size:26px;">New member signup</h1>
<p style="margin:0 0 16px;color:#5c4f42;">Sample Side Hustler · newmember@example.com · Free / Adults</p>
<p style="margin:0 0 8px;"><strong>Name:</strong> Sample Side Hustler</p>
<p style="margin:0 0 8px;"><strong>Email:</strong> <a href="mailto:newmember@example.com" style="color:#9B2F28;">newmember@example.com</a></p>
<p style="margin:0 0 8px;"><strong>Plan:</strong> Free (pending activation)</p>
<p style="margin:0 0 8px;"><strong>Lane:</strong> Adults</p>
<p style="margin:16px 0 0;padding:12px;background:#fff4e8;border-radius:10px;"><strong>Action needed:</strong> Open Admin → Users Area and set status to <strong>active</strong> to let them sign in. Activation sends their welcome email + certificate.</p>
<p style="margin:14px 0 0;font-size:13px;color:#8a7a68;">Catch-up for Tina — you now receive every new member signup alert as a partner admin (along with Evelyn, Lyriq, and the ops inbox).</p>
<p style="margin:18px 0 0;"><a href="${SITE}/?next=admin" style="display:inline-block;background:#9B2F28;color:#fff;text-decoration:none;font-weight:800;padding:12px 20px;border-radius:10px;">Open GYSH Admin</a></p>
</td></tr></table></td></tr></table></body></html>`;

const regHtml = `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#f3efe6;font-family:Helvetica,Arial,sans-serif;color:#2d2a26;">
<table width="100%"><tr><td align="center">
<table width="600" style="max-width:600px;background:#fffdf8;border:1px solid #e2d5bc;border-radius:16px;">
<tr><td style="height:6px;background:linear-gradient(90deg,#9B2F28,#D7C697,#9B2F28);"></td></tr>
<tr><td style="padding:28px 32px;">
<p style="margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#9B2F28;">Membership · Pending activation</p>
<h1 style="margin:0 0 10px;font-size:26px;">Welcome to the GYSH family!</h1>
<p style="margin:0 0 16px;color:#5c4f42;">This is the member-facing signup confirmation email (same template new members receive).</p>
<p style="margin:0 0 12px;">We've saved the membership request. An admin activates the account next — then they get a second welcome email.</p>
<p style="margin:16px 0 0;padding:12px 14px;background:#fff4e8;border-radius:12px;border-left:4px solid #9B2F28;"><strong>Next:</strong> A GYSH admin activates the account.</p>
<p style="margin:18px 0 0;"><a href="${SITE}/?next=join" style="display:inline-block;background:#9B2F28;color:#fff;text-decoration:none;font-weight:800;padding:12px 20px;border-radius:10px;">Explore membership</a></p>
</td></tr></table></td></tr></table></body></html>`;

await sendAndLog({
  to: TINA,
  subject: "[GYSH New member signup] Sample Side Hustler · newmember@example.com · Free / Adults",
  html: adminHtml,
  text: "New member signup alert (catch-up for Tina). Open Admin to activate members.",
  templateSlug: "admin_form_notify",
  meta: { formName: "New member signup", catchUp: true, test: false, sentTo: TINA },
});

await sendAndLog({
  to: TINA,
  subject: "Get Your Side Hustle — welcome to the GYSH family!",
  html: regHtml,
  text: "Registration confirmation sample (what new members receive).",
  templateSlug: "registration_confirmation",
  meta: { catchUp: true, sample: true, sentTo: TINA },
});

console.log("Done — Tina received admin signup notify + registration confirmation (logged).");
