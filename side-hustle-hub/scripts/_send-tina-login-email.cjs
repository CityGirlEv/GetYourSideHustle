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
const to = "tinamariebarham@gmail.com";
const cc = "info@getyoursidehustle.com";
const loginUrl = "https://getyoursidehustle.com";

const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f3efe6;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3efe6;padding:24px 12px;"><tr><td align="center">
<table width="600" style="max-width:600px;width:100%;background:#fffdf8;border-radius:18px;border:1px solid #e2d5bc;">
<tr><td style="height:6px;background:linear-gradient(90deg,#9B2F28,#D7C697,#9B2F28);"></td></tr>
<tr><td style="padding:28px 32px;">
<p style="margin:0 0 8px;font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:#9B2F28;">PARTNER UPDATE</p>
<h1 style="margin:0 0 12px;color:#2d2a26;font-size:28px;">Get Your Side Hustle</h1>
<p style="margin:0 0 14px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#3a342e;">Hi Tina —</p>
<p style="margin:0 0 14px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#3a342e;">Quick heads-up: <strong>email is working</strong> on Get Your Side Hustle (this message is the proof).</p>
<p style="margin:0 0 14px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#3a342e;"><strong>Your new login</strong> is your real email address:</p>
<p style="margin:0 0 14px;padding:14px 16px;background:#f7f0df;border-radius:12px;border:1px solid #e2d5bc;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#2d2a26;">
<strong>Email:</strong> tinamariebarham@gmail.com<br/>
<strong>Password:</strong> same as before
</p>
<p style="margin:0 0 14px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#3a342e;">Sign in here: <a href="${loginUrl}" style="color:#9B2F28;font-weight:700;">${loginUrl}</a></p>
<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#8a7a68;">— Evelyn / Get Your Side Hustle<br/>Questions: info@getyoursidehustle.com</p>
</td></tr></table></td></tr></table></body></html>`;

const text = `Hi Tina —

Email is working on Get Your Side Hustle (this message is the proof).

Your new login is your real email address:
Email: tinamariebarham@gmail.com
Password: same as before

Sign in: ${loginUrl}

— Evelyn / Get Your Side Hustle
Questions: info@getyoursidehustle.com
`;

fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from,
    to: [to],
    cc: [cc],
    subject: "Get Your Side Hustle — email works + your new login",
    html,
    text,
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
