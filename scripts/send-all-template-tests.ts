/**
 * Send every email template as a test to a given recipient.
 * Usage: npx tsx scripts/send-all-template-tests.ts [recipient]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as React from "react";
import { render } from "@react-email/components";
import { createClient } from "@supabase/supabase-js";
import { ALL_TEMPLATES } from "../src/lib/email-templates/all-templates.server";
import { template as accountEnabledAdmin } from "../src/lib/email-templates/account-enabled-admin";
import { ensureEmailBranding } from "../src/lib/email-templates/email-branding.server";
import {
  getEmailTemplateOverride,
  htmlToPlainText,
} from "../src/lib/email-templates/overrides.server";
import {
  getTransactionalFromAddress,
  getTransactionalSenderDomain,
  sendTransactionalEmail,
} from "../src/lib/send-transactional-email";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvFile() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const key = line.slice(0, i);
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile();

process.env.PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL?.includes("localhost")
  ? "https://mypartb.pages.dev"
  : (process.env.PUBLIC_SITE_URL ?? "https://mypartb.pages.dev");
process.env.SITE_ORIGIN = process.env.PUBLIC_SITE_URL;

const RECIPIENT = (process.argv[2] ?? "riverashretreat@gmail.com").toLowerCase();
const SEND_DELAY_MS = 300;

function generateUnsubscribeToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getOrCreateUnsubscribeToken(
  supabase: ReturnType<typeof createClient>,
  email: string,
): Promise<string> {
  const normalized = email.toLowerCase();
  const { data: existing } = await supabase
    .from("email_unsubscribe_tokens")
    .select("token, used_at")
    .eq("email", normalized)
    .maybeSingle();
  if (existing?.token && !existing.used_at) return existing.token;

  const token = generateUnsubscribeToken();
  await supabase
    .from("email_unsubscribe_tokens")
    .upsert({ token, email: normalized }, { onConflict: "email", ignoreDuplicates: true });

  const { data: stored } = await supabase
    .from("email_unsubscribe_tokens")
    .select("token")
    .eq("email", normalized)
    .maybeSingle();
  if (!stored?.token) throw new Error(`Failed to create unsubscribe token for ${email}`);
  return stored.token;
}

function subjectFor(
  name: string,
  defaultSubject: string,
  overrideSubject: string | null,
  sampleProps: Record<string, unknown>,
): string {
  if (overrideSubject) return `[TEST] ${overrideSubject}`;
  return `[TEST] ${defaultSubject}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }
  if (!resendKey) {
    console.error("Missing RESEND_API_KEY in .env");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const unsubscribeToken = await getOrCreateUnsubscribeToken(supabase, RECIPIENT);

  const extraTemplates = [
    {
      name: "account-enabled-admin",
      defaultSubject:
        typeof accountEnabledAdmin.subject === "function"
          ? accountEnabledAdmin.subject(accountEnabledAdmin.previewData ?? {})
          : accountEnabledAdmin.subject,
      component: accountEnabledAdmin.component,
      sampleProps: accountEnabledAdmin.previewData ?? {},
      siteUrl: process.env.PUBLIC_SITE_URL,
    },
  ];

  const namesSeen = new Set(ALL_TEMPLATES.map((t) => t.name));
  const templates = [
    ...ALL_TEMPLATES.map((t) => ({
      name: t.name,
      defaultSubject: t.defaultSubject,
      component: t.component,
      sampleProps: t.sampleProps,
      siteUrl: (t.sampleProps.siteUrl as string | undefined) ?? process.env.PUBLIC_SITE_URL ?? "",
    })),
    ...extraTemplates.filter((t) => !namesSeen.has(t.name)),
  ];

  console.log(`Sending ${templates.length} templates to ${RECIPIENT}...\n`);

  const results: Array<{ name: string; ok: boolean; error?: string }> = [];

  for (const tpl of templates) {
    try {
      const element = React.createElement(tpl.component, tpl.sampleProps);
      let html = await render(element);
      let subject = tpl.defaultSubject;

      const override = await getEmailTemplateOverride(tpl.name);
      if (override) {
        html = override.html;
        subject = override.subject;
      }

      html = await ensureEmailBranding(html, {
        siteUrl: tpl.siteUrl || process.env.PUBLIC_SITE_URL,
        unsubscribeToken,
      });
      const text = htmlToPlainText(html);
      const messageId = crypto.randomUUID();

      await supabase.from("email_send_log").insert({
        message_id: messageId,
        template_name: `${tpl.name} (bulk-test)`,
        recipient_email: RECIPIENT,
        status: "pending",
      });

      await sendTransactionalEmail({
        message_id: messageId,
        to: RECIPIENT,
        from: getTransactionalFromAddress(),
        sender_domain: getTransactionalSenderDomain(),
        subject: subjectFor(
          tpl.name,
          tpl.defaultSubject,
          override?.subject ?? null,
          tpl.sampleProps,
        ),
        html,
        text,
        purpose: "transactional",
        label: `${tpl.name}-bulk-test`,
        idempotency_key: messageId,
        unsubscribe_token: unsubscribeToken,
      });

      await supabase
        .from("email_send_log")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("message_id", messageId);

      console.log(`✓ ${tpl.name}`);
      results.push({ name: tpl.name, ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`✗ ${tpl.name}: ${msg}`);
      results.push({ name: tpl.name, ok: false, error: msg });
    }

    await sleep(SEND_DELAY_MS);
  }

  const sent = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  console.log(`\nDone: ${sent}/${templates.length} sent.`);
  if (failed.length) {
    console.log("Failed:", failed.map((f) => `${f.name} (${f.error})`).join(", "));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
