/**
 * Seed or upgrade every email template override in Supabase to use {{mergeField}} tokens.
 *
 * Usage:
 *   node scripts/migrate-all-template-overrides-to-merge-fields.mjs
 *   node scripts/migrate-all-template-overrides-to-merge-fields.mjs --dry-run
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dryRun = process.argv.includes("--dry-run");

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8").split(/\r?\n/)) {
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
const { createClient } = await import("@supabase/supabase-js");
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const { ALL_TEMPLATES, renderDefaultHtmlWithMergeFields, getTemplateDefaultSubjectForEditor } =
  await import(
    pathToFileURL(path.join(__dirname, "..", "src/lib/email-templates/all-templates.server.tsx"))
      .href
  );

console.log(dryRun ? "DRY RUN — no writes" : "Migrating template overrides to merge fields…");
console.log(`Templates: ${ALL_TEMPLATES.length}`);

let upserted = 0;
for (const tpl of ALL_TEMPLATES) {
  const html = await renderDefaultHtmlWithMergeFields(tpl.name);
  const subject = getTemplateDefaultSubjectForEditor(tpl.name);
  const hasMerge = /\{\{[a-zA-Z0-9_.]+\}\}/.test(html) || /\{\{[a-zA-Z0-9_.]+\}\}/.test(subject);

  console.log(`\n${tpl.name}`);
  console.log(`  subject: ${subject}`);
  console.log(`  merge tokens in html: ${hasMerge}`);

  if (dryRun) continue;

  const { error } = await sb.from("email_template_overrides").upsert(
    {
      template_name: tpl.name,
      subject,
      html,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "template_name" },
  );
  if (error) {
    console.error(`  ERROR: ${error.message}`);
    process.exitCode = 1;
    continue;
  }
  upserted++;
  console.log("  ✓ upserted");
}

if (!dryRun) {
  console.log(`\nDone. Upserted ${upserted}/${ALL_TEMPLATES.length} overrides.`);
} else {
  console.log("\nDry run complete. Re-run without --dry-run to write.");
}
