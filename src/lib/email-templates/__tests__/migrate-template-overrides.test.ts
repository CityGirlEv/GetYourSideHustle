/**
 * Run: npm test -- src/lib/email-templates/__tests__/migrate-template-overrides.test.ts
 *
 * Seeds every email template override in Supabase with {{mergeField}} tokens.
 * Set MIGRATE_TEMPLATE_OVERRIDES=1 to execute writes (otherwise dry-run only).
 */
import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";
import {
  ALL_TEMPLATES,
  renderDefaultHtmlWithMergeFields,
  getTemplateDefaultSubjectForEditor,
} from "../all-templates.server";

const shouldWrite = process.env.MIGRATE_TEMPLATE_OVERRIDES === "1";

describe("migrate template overrides to merge fields", () => {
  it("upgrades every template to {{mergeField}} syntax", async () => {
    const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.warn("Skipping migration — SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set");
      return;
    }

    const sb = createClient(url, key);
    const results: Array<{ name: string; subject: string; hasMerge: boolean }> = [];

    for (const tpl of ALL_TEMPLATES) {
      const html = await renderDefaultHtmlWithMergeFields(tpl.name);
      const subject = getTemplateDefaultSubjectForEditor(tpl.name);
      const hasMerge = /\{\{[a-zA-Z0-9_.]+\}\}/.test(html + subject);

      expect(hasMerge, `${tpl.name} should contain merge tokens`).toBe(true);
      results.push({ name: tpl.name, subject, hasMerge });

      if (!shouldWrite) continue;

      const { error } = await sb.from("email_template_overrides").upsert(
        {
          template_name: tpl.name,
          subject,
          html,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "template_name" },
      );
      expect(error, `${tpl.name} upsert`).toBeNull();
    }

    console.log(
      shouldWrite
        ? `Upserted ${results.length} template overrides with merge fields.`
        : `Dry run OK for ${results.length} templates. Set MIGRATE_TEMPLATE_OVERRIDES=1 to write.`,
    );
    for (const r of results) {
      console.log(`  ${r.name}: ${r.subject}`);
    }
  }, 120_000);
});
