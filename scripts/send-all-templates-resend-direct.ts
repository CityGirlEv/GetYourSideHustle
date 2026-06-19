/**
 * Render every email template and send directly via Resend (bypasses queue).
 * Uses admin-saved overrides from Supabase when present (same as production).
 *
 * Usage:
 *   npx vite-node scripts/send-all-templates-resend-direct.ts
 *   npx vite-node scripts/send-all-templates-resend-direct.ts evelyn3@cox.net sharpebanker@yahoo.com
 */
import fs from "fs";
import * as React from "react";
import { render } from "@react-email/components";
import { createClient } from "@supabase/supabase-js";
import { ALL_TEMPLATES } from "../src/lib/email-templates/all-templates.server";
import { TEMPLATES } from "../src/lib/email-templates/registry";
import { htmlToPlainText } from "../src/lib/email-templates/overrides.server";

function loadEnv() {
  const env: Record<string, string> = {};
  for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[line.slice(0, i)] = val;
  }
  return env;
}

const env = loadEnv();
const key = env.RESEND_API_KEY?.trim();
if (!key?.startsWith("re_")) {
  console.error("RESEND_API_KEY missing in .env");
  process.exit(1);
}

const sb = createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!);

async function getOverride(name: string) {
  const { data } = await sb
    .from("email_template_overrides")
    .select("subject, html")
    .eq("template_name", name)
    .maybeSingle();
  if (!data) return null;
  return {
    subject: data.subject,
    html: data.html,
    text: htmlToPlainText(data.html),
  };
}

const recipients =
  process.argv.length > 2 ? process.argv.slice(2) : ["evelyn3@cox.net", "sharpebanker@yahoo.com"];

const from = env.EMAIL_FROM ?? "Part B Optimizer <noreply@mypartb.com>";
const templateNames = Array.from(
  new Set([...ALL_TEMPLATES.map((t) => t.name), ...Object.keys(TEMPLATES)]),
).sort();

function resolveTemplate(name: string) {
  const descriptor = ALL_TEMPLATES.find((t) => t.name === name);
  const registry = TEMPLATES[name as keyof typeof TEMPLATES];
  if (!descriptor && !registry) return null;
  const component = registry?.component ?? descriptor!.component;
  const previewData = (registry?.previewData ?? descriptor?.sampleProps ?? {}) as Record<
    string,
    unknown
  >;
  const subject =
    registry?.subject && typeof registry.subject === "function"
      ? registry.subject(previewData)
      : (registry?.subject ?? descriptor?.defaultSubject ?? `[TEST] ${name}`);
  return { name, component, previewData, subject: `[TEST] ${subject}` };
}

let sent = 0;
let failed = 0;

for (const recipient of recipients) {
  console.log(`\n=== ${recipient} ===`);
  for (const name of templateNames) {
    const tpl = resolveTemplate(name);
    if (!tpl) continue;

    const override = await getOverride(name);
    let html: string;
    let text: string;
    let subject: string;

    if (override) {
      html = override.html;
      text = override.text;
      subject = `[TEST] ${override.subject}`;
    } else {
      html = await render(React.createElement(tpl.component, tpl.previewData));
      text = await render(React.createElement(tpl.component, tpl.previewData), {
        plainText: true,
      });
      subject = tpl.subject;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `bulk-test-v2-${name}-${recipient}`,
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        subject,
        html,
        text,
      }),
    });
    const body = await res.text();
    if (res.ok) {
      sent++;
      console.log(`  ✓ ${name}${override ? " (override)" : ""}`);
    } else {
      failed++;
      console.error(`  ✗ ${name}: ${res.status} ${body.slice(0, 200)}`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
}

console.log(`\nDone: ${sent} sent, ${failed} failed → ${recipients.join(", ")}`);
