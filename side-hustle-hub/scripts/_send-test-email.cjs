const fs = require("fs");

const env = Object.fromEntries(
  fs
    .readFileSync(".dev.vars", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const key = (env.RESEND_API_KEY || "").trim();
const from = (env.EMAIL_FROM || "Get Your Side Hustle <noreply@getyoursidehustle.com>").trim();
const to = process.argv[2] || "evelyn3@cox.net";

const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f3efe6;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3efe6;padding:24px 12px;"><tr><td align="center">
<table width="600" style="max-width:600px;width:100%;background:#fffdf8;border-radius:18px;border:1px solid #e2d5bc;">
<tr><td style="height:6px;background:linear-gradient(90deg,#9B2F28,#D7C697,#9B2F28);"></td></tr>
<tr><td style="padding:28px 32px;">
<p style="margin:0 0 8px;font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:#9B2F28;">EMAIL TEST</p>
<h1 style="margin:0 0 12px;color:#2d2a26;font-size:28px;">Get Your Side Hustle</h1>
<p style="margin:0 0 14px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#3a342e;">Hi Evelyn — this is a live Resend test from the <strong>Get Your Side Hustle</strong> account.</p>
<p style="margin:0 0 14px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#3a342e;"><strong>From:</strong> ${from.replace(/</g, "&lt;").replace(/>/g, "&gt;")}<br/><strong>Domain:</strong> getyoursidehustle.com (verified)</p>
<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#8a7a68;">If this lands in spam, mark Not spam so Cox learns the domain.</p>
</td></tr></table></td></tr></table></body></html>`;

fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from,
    to: [to],
    subject: "Get Your Side Hustle — email test (clean branding)",
    html,
    text: `Get Your Side Hustle email test.\nFrom: ${from}\nDomain: getyoursidehustle.com (verified)`,
  }),
})
  .then(async (r) => {
    const t = await r.text();
    console.log("HTTP", r.status);
    console.log(t);
    if (!r.ok) process.exit(1);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
