/**
 * Remove legacy “Get Part B …” from stored templates, articles, and content drafts.
 * Usage: node scripts/rebrand-drop-get-part-b.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return {};
  const out = {};
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[m[1]] = val;
  }
  return out;
}

function normalizeBrand(text) {
  if (!text) return text;
  let result = text;
  const replacements = [
    ["Get Get Part B Optimizer", "Part B Optimizer"],
    ["GET PART B OPTIMIZER", "PART B OPTIMIZER"],
    ["The Get Part B Optimizer", "The Part B Optimizer"],
    ["Get Part B Optimizer", "Part B Optimizer"],
    ["Get Part B", "Part B"],
    ["get part b optimizer", "part b optimizer"],
  ];
  for (const [from, to] of replacements) {
    if (result.includes(from)) result = result.split(from).join(to);
  }
  return result;
}

function normalizeBrandJson(value) {
  if (typeof value === "string") return normalizeBrand(value);
  if (Array.isArray(value)) return value.map(normalizeBrandJson);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, normalizeBrandJson(nested)]),
    );
  }
  return value;
}

const env = { ...loadEnv(), ...process.env };
const url = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const sb = createClient(url, key);

async function updateTable(table, textFields, idField = "id") {
  const { data, error } = await sb.from(table).select("*");
  if (error) throw new Error(`${table}: ${error.message}`);
  let updated = 0;
  for (const row of data ?? []) {
    const patch = {};
    let changed = false;
    for (const field of textFields) {
      const next = normalizeBrand(row[field] ?? "");
      if (next !== (row[field] ?? "")) {
        patch[field] = next;
        changed = true;
      }
    }
    if (!changed) continue;
    const { error: upErr } = await sb.from(table).update(patch).eq(idField, row[idField]);
    if (upErr) throw new Error(`${table} update ${row[idField]}: ${upErr.message}`);
    updated += 1;
  }
  console.log(`${table}: updated ${updated} row(s)`);
}

async function updateContentDrafts() {
  const { data, error } = await sb.from("content_drafts").select("*");
  if (error) throw new Error(`content_drafts: ${error.message}`);
  let updated = 0;
  for (const row of data ?? []) {
    const patch = {
      title: normalizeBrand(row.title ?? ""),
      excerpt: normalizeBrand(row.excerpt ?? ""),
      body: normalizeBrand(row.body ?? ""),
      payload: normalizeBrandJson(row.payload ?? {}),
      updated_at: new Date().toISOString(),
    };
    const unchanged =
      patch.title === (row.title ?? "") &&
      patch.excerpt === (row.excerpt ?? "") &&
      patch.body === (row.body ?? "") &&
      JSON.stringify(patch.payload) === JSON.stringify(row.payload ?? {});
    if (unchanged) continue;
    const { error: upErr } = await sb.from("content_drafts").update(patch).eq("id", row.id);
    if (upErr) throw new Error(`content_drafts update ${row.id}: ${upErr.message}`);
    updated += 1;
  }
  console.log(`content_drafts: updated ${updated} row(s)`);
}

async function updateContentDraftVersions() {
  const { data, error } = await sb.from("content_draft_versions").select("*");
  if (error) throw new Error(`content_draft_versions: ${error.message}`);
  let updated = 0;
  for (const row of data ?? []) {
    const snapshot = normalizeBrandJson(row.snapshot ?? {});
    if (JSON.stringify(snapshot) === JSON.stringify(row.snapshot ?? {})) continue;
    const { error: upErr } = await sb
      .from("content_draft_versions")
      .update({ snapshot })
      .eq("id", row.id);
    if (upErr) throw new Error(`content_draft_versions update ${row.id}: ${upErr.message}`);
    updated += 1;
  }
  console.log(`content_draft_versions: updated ${updated} row(s)`);
}

async function main() {
  await updateTable("email_template_overrides", ["subject", "html"], "template_name");
  await updateTable("email_template_versions", ["subject", "html"]);
  await updateTable("learning_articles", ["title", "meta_description", "excerpt", "body_md"], "slug");
  await updateTable(
    "learning_article_versions",
    ["title", "meta_description", "excerpt", "body_md"],
    "id",
  );
  await updateContentDrafts();
  await updateContentDraftVersions();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
